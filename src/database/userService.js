import { db } from './db.js'

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
      INSERT INTO users (mac, number, status, created_at)
      VALUES (?, NULL, 'online', ?)
    `).run(mac, now)

    return { status: 'added', mac }
  } else {
    // Foydalanuvchining statusini yangilash
    db.prepare(`
      UPDATE users SET status = 'online' WHERE mac = ?
    `).run(mac)

    return { status: 'updated', mac }
  }
}

/**
 * Barcha foydalanuvchilar ro‘yxatini olish
 * @returns {array} - foydalanuvchilar ro‘yxati
 */
export function getAllUsers() {
  // Foydalanuvchilarni olish va tartiblash (number bo‘yicha)
  return db.prepare('SELECT * FROM users ORDER BY number ASC').all()
}
