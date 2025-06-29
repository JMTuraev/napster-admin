// src/main/socketServer.js

import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleUserEvents } from './userHandlers.js'  // Foydalanuvchi eventlari

export function startSocketServer() {
  const httpServer = createServer()
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client ulandi:', socket.id)

    // Foydalanuvchi bilan bog‘liq eventlarni handle qilish
    handleUserEvents(socket, io)
  })

  httpServer.listen(3000, () => {
    console.log('🟢 Socket server ishlayapti: http://localhost:3000')
  })
}
