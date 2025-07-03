import Database from 'better-sqlite3'
import { join, basename, extname } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import extractIcon from 'extract-file-icon'

// 📁 DB joylashuvi
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })

const dbPath = join(dbDir, 'napster.db')
const db = new Database(dbPath)

// 📁 ICONS papkasi (frontend uchun mos)
const iconsDir = join(process.cwd(), 'src', 'renderer', 'public', 'icons')
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })

const DEFAULT_ICON_PATH = '/icons/default-icon.png'

// ✅ levels jadvali
db.prepare(`
  CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1
  )
`).run()

// Standart levels
const defaultLevels = ['Standard', 'Silver', 'Gold', 'Platinum', 'Diamond']
const insertLevel = db.prepare(`INSERT OR IGNORE INTO levels (name, is_active) VALUES (?, 1)`)
defaultLevels.forEach(level => insertLevel.run(level))

// ✅ users jadvali
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

// ✅ sessions jadvali
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

// ✅ logs jadvali
db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_mac TEXT,
    event TEXT,
    timestamp TEXT,
    details TEXT
  )
`).run()

// ✅ games jadvali
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    exe TEXT,
    path TEXT UNIQUE,
    icon TEXT
  )
`).run()

// 🔄 icon migratsiyasi
try {
  db.prepare(`ALTER TABLE games ADD COLUMN icon TEXT`).run()
} catch (e) {}

// Iconni olish yoki defaultni qaytarish
export function getOrSaveGameIcon(exePath, gameName = '') {
  try {
    if (!existsSync(exePath)) throw new Error('Exe mavjud emas')

    const iconBuffer = extractIcon(exePath, 256)
    if (!iconBuffer) throw new Error('Icon olinmadi')

    const iconFileName = `${gameName || basename(exePath, extname(exePath))}_${Date.now()}.ico`
    const iconFullPath = join(iconsDir, iconFileName)
    writeFileSync(iconFullPath, iconBuffer)

    return `/icons/${iconFileName}`
  } catch (e) {
    return DEFAULT_ICON_PATH
  }
}

// 🎮 O‘yin qo‘shish funksiyasi (icon bilan)
export function addGame({ name, exe, path, icon }) {
  db.prepare(`
    INSERT OR IGNORE INTO games (name, exe, path, icon)
    VALUES (?, ?, ?, ?)
  `).run(name, exe, path, icon || DEFAULT_ICON_PATH)
}

// 🎮 O‘yin avtomatik icon bilan qo‘shiladi
export function addGameAutoIcon({ name, exe, path }) {
  const icon = getOrSaveGameIcon(path, name)
  addGame({ name, exe, path, icon })
}

// 🎮 Barcha o‘yinlar
export function getAllGames() {
  return db.prepare(`SELECT * FROM games`).all()
}

// 📤 DB obyektini eksport qilish
export { db }
