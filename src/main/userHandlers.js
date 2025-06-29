// src/main/userHandlers.js

import { addOrUpdateUser } from '../database/userService.js'  // Foydalanuvchi bilan bog‘liq funksiyalar

export function handleUserEvents(socket, io) {
  // 🟢 USER – yangi MAC yozish
  socket.on('new-user', (data) => {
    const mac = data?.mac
    if (!mac) {
      console.warn('⚠️ MAC address yo‘q:', data)
      return
    }

    console.log('📥 Yangi user MAC:', mac)

    try {
      const result = addOrUpdateUser(mac) // Foydalanuvchini qo‘shish yoki yangilash
      console.log('✅ User qayd etildi:', result)

      // 🟢 Barcha frontendlarga yuborish
      io.emit('new-user', { mac })
    } catch (err) {
      console.error('❌ Bazaga yozishda xatolik:', err)
    }
  })
}
