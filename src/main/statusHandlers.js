// src/main/statusHandlers.js

import { ipcMain } from 'electron'
import { db } from '../database/db.js'

/**
 * Barcha darajalarni olish (admin uchun)
 */
ipcMain.handle('get-all-levels', () => {
  try {
    const levels = db.prepare(`SELECT * FROM levels ORDER BY id ASC`).all()
    return { status: 'ok', data: levels }
  } catch (err) {
    console.error('❌ Darajalarni olishda xatolik:', err.message)
    return { status: 'error', message: err.message }
  }
})

/**
 * Faqat active bo‘lgan level (foydalanuvchi dropdown uchun)
 */
ipcMain.handle('get-levels', () => {
  try {
    const levels = db
      .prepare('SELECT id, name FROM levels WHERE is_active = 1')
      .all()
    return levels
  } catch (err) {
    console.error('❌ Active darajalarni olishda xatolik:', err.message)
    return []
  }
})

/**
 * Faqat bitta darajani active qilish (admin panel uchun switch)
 */
ipcMain.handle('set-active-level', (event, levelId) => {
  try {
    const tx = db.transaction(() => {
      db.prepare(`UPDATE levels SET is_active = 0`).run()
      db.prepare(`UPDATE levels SET is_active = 1 WHERE id = ?`).run(levelId)
    })
    tx()

    console.log(`✅ Active level yangilandi: ${levelId}`)
    return { status: 'ok' }
  } catch (err) {
    console.error('❌ Active level yangilashda xatolik:', err.message)
    return { status: 'error', message: err.message }
  }
})

/**
 * Foydalanuvchining level_id (status) ni yangilash
 */
ipcMain.handle('update-user-level', (event, { mac, levelId }) => {
  try {
    db.prepare(
      `UPDATE users SET level_id = ? WHERE mac = ?`
    ).run(levelId, mac)

    console.log(`✅ Foydalanuvchi ${mac} uchun level_id yangilandi: ${levelId}`)
    return { status: 'ok' }
  } catch (err) {
    console.error('❌ Foydalanuvchi level_id yangilashda xatolik:', err.message)
    return { status: 'error', message: err.message }
  }
})
