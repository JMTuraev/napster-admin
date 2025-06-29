// src/main/socketServer.js

import { Server } from 'socket.io'
import { createServer } from 'http'
import { addOrUpdateUser } from '../database/userService.js'

export function startSocketServer() {
  const httpServer = createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client ulandi:', socket.id)

    socket.on('new-user', (data) => {
      const mac = data?.mac

      if (!mac) {
        console.warn('⚠️ MAC address yo‘q:', data)
        return
      }

      console.log('📥 Yangi user MAC:', mac)

      try {
        const result = addOrUpdateUser(mac)
        console.log('✅ User qayd etildi:', result)

        // 🟢 Barcha frontendlarga yuborish
        io.emit('new-user', { mac })
      } catch (err) {
        console.error('❌ Bazaga yozishda xatolik:', err)
      }
    })
  })

  httpServer.listen(3000, () => {
    console.log('🟢 Socket server ishlayapti: http://localhost:3000')
  })
}
