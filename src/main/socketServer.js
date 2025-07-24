// src/main/socketServer.js
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleUserEvents } from './userHandlers.js'
import { handleGameEvents } from './gameHandlers.js'
import { getOwnerPassword } from '../database/settingsService.js' // ⬅️ Parolni olish

const ADMIN_STATIC_IP = '192.168.1.10'

export function startSocketServer() {
  const httpServer = createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client ulandi:', socket.id)

    // 🔧 Avvalgi handlerlar (o‘zgarmaydi)
    handleUserEvents(socket, io)
    handleGameEvents(socket, io)

    // 🆕 Parolni tekshirish (user.exe dan yuboriladi)
    socket.on('check-owner-password', async ({ password }, callback) => {
      try {
        const correct = await getOwnerPassword()
        const isMatch = password === correct
        callback({ ok: isMatch })
      } catch (err) {
        console.error('❌ check-owner-password xatolik:', err)
        callback({ ok: false })
      }
    })
  })

  // ⏯ Tinglash
  httpServer.listen(3000, '0.0.0.0', () => {
    console.log('🟢 Socket server ishlayapti: http://0.0.0.0:3000')
    console.log(`🟢 LAN orqali:   http://${ADMIN_STATIC_IP}:3000`)
    console.log('Aynan shu IP-ni USER APP GA YOZASIZ!')
  })

  return io
}
