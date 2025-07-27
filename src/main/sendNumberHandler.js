// src/socketHandlers/sendNumberHandler.js
import { db } from '../database/db.js'

export function registerSendNumberPcHandler(socket, io) {
  // ❌ eski destructuring o‘rniga faqat () yozamiz
  socket.on('send-number-pc', () => {
    console.log('📡 [send-number-pc] signal qabul qilindi')

    try {
      const users = db.prepare('SELECT mac, number FROM users WHERE number IS NOT NULL').all()

      users.forEach((user) => {
        io.emit(`receive-pc-ui-${user.mac}`, {
          mac: user.mac,
          number: user.number
        })
      })

      console.log(`📤 ${users.length} ta user.exe'ga raqamlar yuborildi.`)
    } catch (err) {
      console.error('❌ send-number-pc xatolik:', err.message)
    }
  })
}
