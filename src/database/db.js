import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync, copyFileSync } from 'fs'

// 1️⃣ Tashqi katalog va fayl
const dbDir = join('C:', 'GameBookingAdmin', 'database')
const dbPath = join(dbDir, 'napster.db')

// 2️⃣ Papka mavjudligini tekshir, bo‘lmasa yarat
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })

// 3️⃣ Loyihadagi backup db (birinchi ishga tushirish uchun)
const backupDb = join(process.cwd(), 'data', 'napster.db')

// 4️⃣ Agar tashqi db yo‘q va loyihada backup bor bo‘lsa, ko‘chir
if (!existsSync(dbPath) && existsSync(backupDb)) {
  copyFileSync(backupDb, dbPath)
  console.log(`[DB] napster.db -> ${dbPath} ga ko‘chirildi`)
}

// 5️⃣ Db instance ochiladi (faqat tashqi path bilan)
export const db = new Database(dbPath)
