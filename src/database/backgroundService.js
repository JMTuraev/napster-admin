import { db } from './db.js'

// Jadvalni yaratish (agar mavjud bo‘lmasa)
export function initBackgroundTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS background_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      selected INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()
}

// ➕ Qo‘shish
export function insertBackground(fileName, url) {
  const stmt = db.prepare(`
    INSERT INTO background_images (file_name, url)
    VALUES (?, ?)
  `)
  stmt.run(fileName, url)
}

// 📖 Barchasini o‘qish
export function getAllBackgrounds() {
  return db.prepare(`
    SELECT * FROM background_images
    ORDER BY created_at DESC
  `).all()
}

// ❌ O‘chirish (file_name orqali)
export function deleteBackground(fileName) {
  db.prepare(`
    DELETE FROM background_images WHERE file_name = ?
  `).run(fileName)
}

// ✅ Tanlangan fonni belgilash (faqat bitta bo‘ladi)
export function setSelectedBackground(fileName) {
  db.prepare(`UPDATE background_images SET selected = 0`).run() // avval barchasini 0
  db.prepare(`UPDATE background_images SET selected = 1 WHERE file_name = ?`).run(fileName)
}

// 🔁 Oxirgi tanlangan fonni olish (user.exe ochilganda ishlatish mumkin)
export function getSelectedBackground() {
  return db.prepare(`
    SELECT * FROM background_images WHERE selected = 1 LIMIT 1
  `).get()
}
