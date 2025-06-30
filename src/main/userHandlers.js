// src/main/userHandlers.js

import { addOrUpdateUser } from '../database/userService.js'
import { ipcMain } from 'electron'
import { db } from '../database/db.js'

/**
 * SOCKET bilan ishlaydigan barcha user hodisalarini ro‘yxatdan o‘tkazish
 */
export function handleUserEvents(socket, io) {
  // 🟢 Yangi user MAC yubordi
  socket.on('new-user', (data) => {
    const mac = data?.mac

    if (!mac) {
      console.warn('⚠️ MAC address yo‘q:', data)
      return
    }

    console.log('📥 Yangi user MAC:', mac)

    try {
      // ✅ Bazaga yozish yoki yangilash
      const result = addOrUpdateUser(mac)
      console.log('✅ User qayd etildi:', result)

      // 🟢 Barcha clientlarga xabar berish
      io.emit('new-user', {
        mac,
        status: 'updated'
      })
    } catch (err) {
      console.error('❌ Bazaga yozishda xatolik:', err.message || err)
    }
  })

  // 🔄 Timer sahifasidan: barcha userlarni olish
  socket.on('get-users', () => {
    try {
      const users = db.prepare('SELECT * FROM users').all()
      socket.emit('users', users)
    } catch (err) {
      console.error('❌ Foydalanuvchilarni olishda xatolik:', err.message || err)
    }
  })
}

/**
 * IPC orqali foydalanuvchi raqamini yangilash
 */
ipcMain.handle('update-user-number', (event, { mac, newNumber }) => {
  try {
    const tx = db.transaction(() => {
      // Eski egasidan raqamni olib tashlaymiz
      db.prepare(`UPDATE users SET number = NULL WHERE number = ?`).run(newNumber)

      // Yangisini belgilaymiz
      db.prepare(`UPDATE users SET number = ? WHERE mac = ?`).run(newNumber, mac)
    })

    tx()

    console.log(`🔁 Raqam yangilandi: MAC ${mac} → ${newNumber}`)
    return { status: 'ok' }
  } catch (err) {
    console.error('❌ Raqam yangilashda xatolik:', err.message || err)
    return { status: 'error', message: err.message }
  }
})
