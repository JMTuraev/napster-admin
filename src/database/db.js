// src/database/db.js

import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// 📁 Bazani joylashuvi
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir)

const dbPath = join(dbDir, 'napster.db')
const db = new Database(dbPath)

// ✅ USERS jadvali – faqat admin "number" beradi
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    mac TEXT PRIMARY KEY,
    number TEXT UNIQUE,            -- NULL bo‘lishi mumkin, keyinchalik admin tomonidan belgilanadi
    status TEXT DEFAULT 'offline', -- online yoki offline
    created_at TEXT
  )
`).run()

// ✅ SESSIONS jadvali – ish vaqti statistikasi uchun
db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_mac TEXT,
    start_time TEXT,
    end_time TEXT,
    duration INTEGER,              -- daqiqada (yoki soniyada) saqlash mumkin
    paid INTEGER DEFAULT 0        -- 0 = to‘lanmagan, 1 = to‘langan
  )
`).run()

// ✅ LOGS jadvali – harakatlar tarixi uchun
db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_mac TEXT,
    event TEXT,                   -- masalan: "start-session", "stop-session", "payment"
    timestamp TEXT,
    details TEXT                  -- qo‘shimcha info, optional
  )
`).run()

export default db
