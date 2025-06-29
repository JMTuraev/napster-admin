// src/database/userService.js

import db from './db.js'

/**
 * Foydalanuvchini qo‘shish yoki yangilash
 * @param {string} mac - MAC address
 * @returns {object} - { status, mac }
 */
export function addOrUpdateUser(mac) {
  const now = new Date().toISOString()

  const existingUser = db.prepare(`
    SELECT * FROM users WHERE mac = ?
  `).get(mac)

  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (mac, number, status, created_at)
      VALUES (?, NULL, 'online', ?)
    `).run(mac, now)

    return { status: 'added', mac }
  } else {
    db.prepare(`
      UPDATE users SET status = 'online' WHERE mac = ?
    `).run(mac)

    return { status: 'updated', mac }
  }
}

/**
 * Barcha foydalanuvchilar ro‘yxati
 * @returns {array} - foydalanuvchilar
 */
export function getAllUsers() {
  return db.prepare(`
    SELECT * FROM users ORDER BY number ASC
  `).all()
}
