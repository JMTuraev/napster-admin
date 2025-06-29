import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// 📁 Bazani joylashuvi
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir)

const dbPath = join(dbDir, 'napster.db')
const db = new Database(dbPath)

// ✅ Jadval yaratishlar
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    mac TEXT PRIMARY KEY,
    number TEXT UNIQUE,
    status TEXT DEFAULT 'offline',
    created_at TEXT
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

// 👤 Userlar funksiyasi (Agar kerak bo‘lsa boshqa faylda import qilinadi)
export function addOrUpdateUser(mac) {
  const now = new Date().toISOString()

  const existingUser = db.prepare(`SELECT * FROM users WHERE mac = ?`).get(mac)

  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (mac, number, status, created_at)
      VALUES (?, NULL, 'online', ?)
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
  return db.prepare(`SELECT * FROM users ORDER BY number ASC`).all()
}

// 📤 Baza obyektining o‘zi (Agar kerak bo‘lsa)
export { db }
