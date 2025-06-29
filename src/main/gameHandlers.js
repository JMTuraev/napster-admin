import { addGame, getAllGames } from '../database/db.js'
import { basename } from 'path'

export function handleGameEvents(socket, io) {
  // 🟢 O‘yin qo‘shish
  socket.on('add-game', (data) => {
    try {
      // ✅ Tekshiruv: path mavjudmi va stringmi
      if (!data?.path || typeof data.path !== 'string') {
        throw new Error('Yuborilgan path noto‘g‘ri yoki mavjud emas')
      }

      const path = data.path.trim()
      const exe = basename(path) // Masalan: chrome.exe
      const name = exe.replace('.exe', '') // Faqat nomi

      const game = { name, exe, path }

      addGame(game) // ➕ DB ga yozish
      console.log('✅ O‘yin qo‘shildi:', game)

      io.emit('new-game', game) // 🎯 Hamma clientlarga jonatish
    } catch (err) {
      console.error('❌ O‘yin DB saqlashda xatolik:', err.message)
    }
  })

  // 📋 Barcha o‘yinlarni olish
  socket.on('get-games', () => {
    try {
      const games = getAllGames()
      socket.emit('games', games)
    } catch (err) {
      console.error('❌ O‘yinlar olishda xatolik:', err.message)
    }
  })
}
