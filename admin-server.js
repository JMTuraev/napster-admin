import { createServer } from 'http'
import { Server } from 'socket.io'

// 📦 DB funksiyasi (agar mavjud bo‘lsa)
import { addOrUpdateUser } from './src/database/userService.js' // yo‘lingizni moslang

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket) => {
  console.log('🔌 Yangi ulanish:', socket.id)

  // ✅ Foydalanuvchidan MAC bilan yangi user kelganda
  socket.on('new-user', (user) => {
    console.log('📥 Yangi user keldi:', user)
    const result = addOrUpdateUser(user)
    console.log('💾 DBga yozildi:', result)
  })

  // 🔄 Admin paneldan status o‘zgartirish
  socket.on('status-update', (newStatus) => {
    console.log('📤 Admindan status:', newStatus)
    socket.broadcast.emit('status-update', newStatus)
  })
})

httpServer.listen(3000, () => {
  console.log('🟢 Socket server → http://localhost:3000')
})
