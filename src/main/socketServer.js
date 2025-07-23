// src/main/socketServer.js yoki shu yo‘nalishda

import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleUserEvents } from './userHandlers.js'
import { handleGameEvents } from './gameHandlers.js'

// Admin kompyuterining statik IP manzili (o‘zingizga moslang)
const ADMIN_STATIC_IP = '192.168.1.10' // O‘ZINGIZNING IP-ni yozing!

export function startSocketServer() {
  const httpServer = createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: '*', // kerak bo‘lsa frontend domenini yozing
    },
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client ulandi:', socket.id)

    // 🔧 Event handlerlar chaqirilmoqda
    handleUserEvents(socket, io)
    handleGameEvents(socket, io)
  })

  // Barcha tarmoq interfeyslarini tinglash ('0.0.0.0')
  httpServer.listen(3000, '0.0.0.0', () => {
    console.log('🟢 Socket server ishlayapti: http://0.0.0.0:3000')
    console.log(`🟢 LAN orqali:   http://${ADMIN_STATIC_IP}:3000`)
    console.log('Aynan shu IP-ni USER APP GA YOZASIZ!')
  })

  return io // ✅ QAYTARAMIZ – bu muhim!
}
