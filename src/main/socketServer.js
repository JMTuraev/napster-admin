import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleUserEvents } from './userHandlers.js'
import { handleGameEvents } from './gameHandlers.js'
import { getOwnerPassword } from '../database/settingsService.js' // ⬅️ Parolni olish
import { registerSendNumberPcHandler } from './sendNumberHandler.js'

const ADMIN_STATIC_IP = '192.168.1.10'

let ioRef = null // ⬅️ global socket server reference saqlash uchun

// 🔌 Socket serverni ishga tushirish
export function startSocketServer() {
  const httpServer = createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  })

  ioRef = io // ⬅️ socket serverni saqlab qo‘yamiz

  io.on('connection', (socket) => {
    console.log('🔌 Client ulandi:', socket.id)

    // 🔧 Oldingi handlerlar
    handleUserEvents(socket, io)
    handleGameEvents(socket, io)
    registerSendNumberPcHandler(socket, io)
    // 🆕 Parolni tekshirish
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

  httpServer.listen(3000, '0.0.0.0', () => {
    console.log('🟢 Socket server ishlayapti: http://0.0.0.0:3000')
    console.log(`🟢 LAN orqali:   http://${ADMIN_STATIC_IP}:3000`)
    console.log('Aynan shu IP-ni USER APP GA YOZASIZ!')
  })

  return io
}

// 📡 FON UCHUN: user.exe ga fon yuboruvchi universal funksiya
export function emitBackgroundUpdate(data) {
  if (ioRef) {
    ioRef.emit('bg-update', data)
    console.log('📡 bg-update yuborildi:', data)
  } else {
    console.warn('⚠️ ioRef mavjud emas — bg-update yuborilmadi')
  }
}
