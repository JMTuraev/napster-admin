import { db } from './db.js'
import { join, basename, extname } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import extractIcon from 'extract-file-icon'

const iconsDir = join(process.cwd(), 'src', 'renderer', 'public', 'icons')
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })
const DEFAULT_ICON_PATH = '/icons/default-icon.png'

// Jadvallar
export function initLevelsAndTabsAndGames() {
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
}

// CRUD
export function getOrSaveGameIcon(exePath, gameName = '') {
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

export function addGame({ name, exe, path, icon, tabId = 1 }) {
  db.prepare(`
    INSERT OR IGNORE INTO games (name, exe, path, icon, tabId)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, exe, path, icon || DEFAULT_ICON_PATH, tabId)
}

export function addGameAutoIcon({ name, exe, path, tabId = 1 }) {
  const icon = getOrSaveGameIcon(path, name)
  addGame({ name, exe, path, icon, tabId })
}

export function getAllGames(tabId) {
  if (typeof tabId === 'number') {
    return db.prepare('SELECT * FROM games WHERE tabId = ? ORDER BY id ASC').all(tabId)
  }
  return db.prepare('SELECT * FROM games ORDER BY id ASC').all()
}

export function getAllTabs() {
  return db.prepare('SELECT * FROM tabs ORDER BY sort_order ASC, id ASC').all()
}
