import Database from 'better-sqlite3'
import { join, basename, extname } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import extractIcon from 'extract-file-icon'

// 📁 DB va ICON papkasi
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
const dbPath = join(dbDir, 'napster.db')
const db = new Database(dbPath)

const iconsDir = join(process.cwd(), 'src', 'renderer', 'public', 'icons')
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })

const DEFAULT_ICON_PATH = '/icons/default-icon.png'

// ========== JADVALLAR ==========

// Levels
db.prepare(`
  CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1
  )
`).run()
const defaultLevels = ['Standard', 'Silver', 'Gold', 'Platinum', 'Diamond']
const insertLevel = db.prepare(`INSERT OR IGNORE INTO levels (name, is_active) VALUES (?, 1)`)
defaultLevels.forEach(level => insertLevel.run(level))

// Tabs
db.prepare(`
  CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    empty BOOLEAN DEFAULT 1
  )
`).run()
const defaultTabs = [
  { id: 1, name: 'Action', sort_order: 1, empty: 1 },
  { id: 2, name: 'Arcade', sort_order: 2, empty: 1 },
  { id: 3, name: 'RPG', sort_order: 3, empty: 1 },
  { id: 4, name: 'Strategy', sort_order: 4, empty: 1 },
  { id: 5, name: 'Puzzle', sort_order: 5, empty: 1 }
]
for (const tab of defaultTabs) {
  db.prepare(`
    INSERT OR IGNORE INTO tabs (id, name, sort_order, empty)
    VALUES (?, ?, ?, ?)
  `).run(tab.id, tab.name, tab.sort_order, tab.empty)
}

// Users
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    mac TEXT PRIMARY KEY,
    number TEXT UNIQUE,
    status TEXT DEFAULT 'offline',
    created_at TEXT,
    level_id INTEGER,
    FOREIGN KEY (level_id) REFERENCES levels(id)
  )
`).run()

// Sessions
db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_mac TEXT,
    start_time TEXT,
    end_time TEXT,
    duration INTEGER,
    paid INTEGER DEFAULT 0
  )
`).run()

// Logs
db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_mac TEXT,
    event TEXT,
    timestamp TEXT,
    details TEXT
  )
`).run()

// Games
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    exe TEXT,
    path TEXT UNIQUE,
    icon TEXT,
    tabId INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY (tabId) REFERENCES tabs(id)
  )
`).run()

// ========== FUNKSIYALAR ==========

// Icon olish/saqlash
function getOrSaveGameIcon(exePath, gameName = '') {
  try {
    if (!existsSync(exePath)) throw new Error('Exe mavjud emas')
    const iconBuffer = extractIcon(exePath, 32)
    if (!iconBuffer) throw new Error('Icon olinmadi')
    const iconFileName = `${gameName || basename(exePath, extname(exePath))}_${Date.now()}.ico`
    const iconFullPath = join(iconsDir, iconFileName)
    writeFileSync(iconFullPath, iconBuffer)
    return `/icons/${iconFileName}`
  } catch (e) {
    return DEFAULT_ICON_PATH
  }
}

// O‘yin qo‘shish (icon va tabId bilan)
function addGame({ name, exe, path, icon, tabId = 1 }) {
  db.prepare(`
    INSERT OR IGNORE INTO games (name, exe, path, icon, tabId)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, exe, path, icon || DEFAULT_ICON_PATH, tabId)
}

// O‘yin avtomatik icon bilan
function addGameAutoIcon({ name, exe, path, tabId = 1 }) {
  const icon = getOrSaveGameIcon(path, name)
  addGame({ name, exe, path, icon, tabId })
}

// Barcha o‘yinlar, optional tabId bilan
function getAllGames(tabId) {
  if (typeof tabId === 'number') {
    return db.prepare('SELECT * FROM games WHERE tabId = ? ORDER BY id ASC').all(tabId)
  }
  return db.prepare('SELECT * FROM games ORDER BY id ASC').all()
}

// Tabs ro‘yxati
function getAllTabs() {
  return db.prepare('SELECT * FROM tabs ORDER BY sort_order ASC, id ASC').all()
}

// Exportlar
export {
  db,
  getOrSaveGameIcon,
  addGame,
  addGameAutoIcon,
  getAllGames,
  getAllTabs
}
