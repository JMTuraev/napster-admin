import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// 📁 Bazani joylashuvi
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir)

const dbPath = join(dbDir, 'napster.db')
const db = new Database(dbPath)

// ✅ levels jadvali (STATUSLAR)
db.prepare(`
  CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1
  )
`).run()

const defaultLevels = ['Standard', 'Silver', 'Gold', 'Platinum', 'Diamond']
const insert = db.prepare(`INSERT OR IGNORE INTO levels (name, is_active) VALUES (?, 1)`)

for (const level of defaultLevels) {
  insert.run(level)
}

console.log('✅ levels jadvali va default darajalar tayyor')

// ✅ Jadval yaratishlar
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

db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_mac TEXT,
    event TEXT,
    timestamp TEXT,
    details TEXT
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    exe TEXT,
    path TEXT UNIQUE
  )
`).run()

// 🎮 O‘yinlar funksiyasi
export function addGame({ name, exe, path }) {
  db.prepare(`
    INSERT OR IGNORE INTO games (name, exe, path)
    VALUES (?, ?, ?)
  `).run(name, exe, path)
}

export function getAllGames() {
  return db.prepare(`SELECT * FROM games`).all()
}

// 👤 Userlar funksiyasi (bazaviy)
export function addOrUpdateUser(mac) {
  const now = new Date().toISOString()

  const existingUser = db.prepare(`SELECT * FROM users WHERE mac = ?`).get(mac)

  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (mac, number, status, created_at, level_id)
      VALUES (?, NULL, 'online', ?, NULL)
    `).run(mac, now)

    return { status: 'added', mac }
  } else {
    db.prepare(`
      UPDATE users SET status = 'online' WHERE mac = ?
    `).run(mac)

    return { status: 'updated', mac }
  }
}

export function getAllUsers() {
  return db.prepare(`
    SELECT users.*, levels.name AS level_name
    FROM users
    LEFT JOIN levels ON users.level_id = levels.id
    ORDER BY number ASC
  `).all()
}

// 📤 Export baza obyekti
export { db }
