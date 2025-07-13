import { db } from './db.js'

/**
 * USERS jadvalini yaratish (agar hali yaratilmagan bo‘lsa)
 */
export function initUserTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac TEXT UNIQUE,
      number INTEGER,
      status TEXT,
      created_at TEXT,
      level_id INTEGER,
      FOREIGN KEY (level_id) REFERENCES levels(id)
    )
  `).run()
}

/**
 * Foydalanuvchini qo‘shish yoki yangilash
 * @param {string} mac - MAC address
 * @returns {object} - { status, mac }
 */
export function addOrUpdateUser(mac) {
  const now = new Date().toISOString()

  // Foydalanuvchini bazada tekshirish
  const existingUser = db.prepare('SELECT * FROM users WHERE mac = ?').get(mac)

  if (!existingUser) {
    // Yangi foydalanuvchini qo‘shish
    db.prepare(`
      INSERT INTO users (mac, number, status, created_at, level_id)
      VALUES (?, NULL, 'online', ?, NULL)
    `).run(mac, now)
    return { status: 'added', mac }
  } else {
    // Mavjud foydalanuvchini faqat statusini yangilash
    db.prepare(`UPDATE users SET status = 'online' WHERE mac = ?`).run(mac)
    return { status: 'updated', mac }
  }
}

/**
 * Barcha foydalanuvchilar ro‘yxatini olish
 * @returns {array} - foydalanuvchilar ro‘yxati
 */
export function getAllUsers() {
  return db.prepare(`
    SELECT users.*, levels.name AS level_name
    FROM users
    LEFT JOIN levels ON users.level_id = levels.id
    ORDER BY number ASC
  `).all()
}
