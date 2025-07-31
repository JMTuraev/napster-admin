// src/main/userHandlers.js

import { addOrUpdateUser } from '../database/userService.js'
import { ipcMain } from 'electron'
import { db } from '../database/db.js'
import {
  isValidMacFormat,
  isVirtualMac,
  isLikelyWifiMac
} from '../utils/macValidator.js'

/**
 * SOCKET orqali user hodisalarini ro‘yxatdan o‘tkazish
 */
export function handleUserEvents(socket, io) {
  /**
   * MAC asosida yangi userni ro‘yxatga olish
   */
  socket.on('new-user', (data) => {
    const mac = data?.mac?.toLowerCase?.()

    if (!mac) {
      console.warn('⚠️ [new-user] MAC yo‘q:', data)
      socket.emit('mac-error', { error: 'MAC topilmadi' })
      socket.disconnect()
      return
    }

    if (!isValidMacFormat(mac)) {
      console.warn('⛔️ [new-user] MAC formati noto‘g‘ri:', mac)
      socket.emit('mac-error', { error: 'MAC formati noto‘g‘ri' })
      socket.disconnect()
      return
    }

    if (isVirtualMac(mac)) {
      console.warn('⛔️ [new-user] Bu virtual adapter MAC:', mac)
      socket.emit('mac-error', { error: 'Virtual adapter MAC manzili' })
      socket.disconnect()
      return
    }

    if (isLikelyWifiMac(mac)) {
      console.warn('⛔️ [new-user] Bu ehtimol Wi-Fi MAC:', mac)
      socket.emit('mac-error', { error: 'Wi-Fi MAC manziliga ruxsat yo‘q' })
      socket.disconnect()
      return
    }

    console.log('📥 [new-user] Ethernet MAC qabul qilindi:', mac)

    try {
      const result = addOrUpdateUser(mac)
      console.log('✅ Bazaga yozildi:', result)

      io.emit('new-user', {
        mac,
        status: 'updated'
      })
    } catch (err) {
      console.error('❌ Bazaga yozishda xatolik:', err.message || err)
      socket.emit('mac-error', { error: 'Bazaga yozishda xatolik' })
    }
  })

  /**
   * Foydalanuvchilarni olish (Timer sahifasi uchun)
   */
  socket.on('get-users', () => {
    try {
      const users = db.prepare('SELECT * FROM users').all()

      const result = users.map((user) => {
        const timer = db.prepare(`
          SELECT * FROM timers 
          WHERE mac = ? AND status = 'running' 
          ORDER BY id DESC LIMIT 1
        `).get(user.mac)

        return {
          ...user,
          ...(timer || {}) // Agar timer mavjud bo‘lsa, qo‘shiladi
        }
      })

      socket.emit('users', result)
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
      db.prepare(`UPDATE users SET number = NULL WHERE number = ?`).run(newNumber)
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
