import { db } from './db.js'

/**
 * Kompyuter raqamini ko‘rsatish sozlamalari jadvalini yaratish
 */
export function initPcNumberUiTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS pc_number_ui_settings (
      id INTEGER PRIMARY KEY,             -- 1 ta yozuv
      show_number INTEGER NOT NULL,       -- 0 yoki 1
      font_size INTEGER NOT NULL,         -- px
      updated_at TEXT                     -- ISO string
    )
  `).run()

  // Faqat 1 ta yozuv saqlanadi (id = 1)
  const exists = db.prepare('SELECT COUNT(*) as count FROM pc_number_ui_settings').get()
  if (exists.count === 0) {
    db.prepare(`
      INSERT INTO pc_number_ui_settings (id, show_number, font_size, updated_at)
      VALUES (1, 1, 36, ?)
    `).run(new Date().toISOString())
  }
}

/**
 * Sozlamalarni olish
 */
export function getPcNumberUiSettings() {
  return db.prepare('SELECT * FROM pc_number_ui_settings WHERE id = 1').get()
}

/**
 * Sozlamalarni yangilash
 * @param {boolean} show_number 
 * @param {number} font_size 
 */
export function updatePcNumberUiSettings(show_number, font_size) {
  const showAsInt = show_number ? 1 : 0
  const now = new Date().toISOString()

  db.prepare(`
    UPDATE pc_number_ui_settings
    SET show_number = ?, font_size = ?, updated_at = ?
    WHERE id = 1
  `).run(showAsInt, font_size, now)
}
