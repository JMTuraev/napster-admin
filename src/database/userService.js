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
    // Yangi foydalanuvchini qo‘shish — level_id kiritilishi shart!
    db.prepare(`
      INSERT INTO users (mac, number, status, created_at, level_id)
      VALUES (?, NULL, 'online', ?, NULL)
    `).run(mac, now)

    return { status: 'added', mac }
  } else {
    // Mavjud foydalanuvchini faqat statusini yangilash
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
  // Agar sizga daraja nomi ham kerak bo‘lsa:
  return db.prepare(`
    SELECT users.*, levels.name AS level_name
    FROM users
    LEFT JOIN levels ON users.level_id = levels.id
    ORDER BY number ASC
  `).all()
}
