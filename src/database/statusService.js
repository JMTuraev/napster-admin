import { db } from './db.js'

/**
 * Level (daraja) jadvalini yaratish
 */
export function createLevelTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT 0
    )
  `).run()

  console.log('✅ levels jadvali tayyor')
}

/**
 * Default level nomlarini qo‘shish va ularni faollashtirish (is_active = 1)
 */
export function insertDefaultLevels() {
  const defaultLevels = ['Standard', 'Silver', 'Gold', 'Platinum', 'Diamond']

  const insert = db.prepare(`
    INSERT OR IGNORE INTO levels (name, is_active) VALUES (?, 1)
  `)

  for (const level of defaultLevels) {
    insert.run(level)
  }

  console.log('✅ Barcha default level statuslar ACTIVE holatda qo‘shildi')
}

// 📦 Dastur ishga tushganda avtomatik yaratish
createLevelTable()
insertDefaultLevels()
