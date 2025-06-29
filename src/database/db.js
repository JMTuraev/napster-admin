import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir)

const dbPath = join(dbDir, 'napster.db')
const db = new Database(dbPath)

// 🧱 Jadval yaratish (birinchi ishga tushishda)
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    mac TEXT PRIMARY KEY,
    name TEXT,
    status TEXT,
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
    paid INTEGER
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

export default db
