import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket) => {
  console.log('🔌 Yangi ulanish:', socket.id)

  // admin status o‘zgartirganda
  socket.on('status-update', (newStatus) => {
    console.log('📤 Admindan status:', newStatus)

    // barcha boshqa clientlarga yuboramiz (masalan, userlarga)
    socket.broadcast.emit('status-update', newStatus)
  })
})

httpServer.listen(3000, () => {
  console.log('🟢 Socket server → http://localhost:3000')
})
