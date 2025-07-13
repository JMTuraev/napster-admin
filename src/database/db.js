import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Fayl katalogini yaratish
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })

// Bazani ochish/yangi yaratish
const dbPath = join(dbDir, 'napster.db')
export const db = new Database(dbPath)
