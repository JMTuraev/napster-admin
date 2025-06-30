import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleUserEvents } from './userHandlers.js'
import { handleGameEvents } from './gameHandlers.js' // 🟢 O‘yin eventlarini import

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

  httpServer.listen(3000, () => {
    console.log('🟢 Socket server ishlayapti: http://localhost:3000')
  })

  return io // ✅ QAYTARAMIZ – bu muhim!
}
