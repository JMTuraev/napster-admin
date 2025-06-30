import fs from 'fs'
import { execFile } from 'child_process'
import { addGame, getAllGames } from '../database/db.js'
import { basename } from 'path'

//
// 🌐 SOCKET EVENTLAR (Admin panel orqali ishlaydi)
//
export function handleGameEvents(socket, io) {
  // 🟢 O‘yin qo‘shish
  socket.on('add-game', (data) => {
    try {
      if (!data?.path || typeof data.path !== 'string') {
        throw new Error('Yuborilgan path noto‘g‘ri yoki mavjud emas')
      }

      const path = data.path.trim()
      const exe = basename(path)
      const name = exe.replace('.exe', '')

      const game = { name, exe, path }

      addGame(game)
      console.log('✅ O‘yin qo‘shildi:', game)

      io.emit('new-game', game)
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

//
// ⚡️ IPCMain handlerlar (Electron tomonidan chaqiriladi)
//
export async function runGameHandler(event, exePath) {
  return new Promise((resolve, reject) => {
    execFile(exePath, (error) => {
      if (error) {
        console.error('❌ O‘yin ishga tushmadi:', error)
        reject(error)
      } else {
        console.log('✅ O‘yin ishga tushdi:', exePath)
        resolve('started')
      }
    })
  })
}

export async function checkPathExistsHandler(event, path) {
  const exists = fs.existsSync(path)
  console.log(`📦 Path tekshirildi: ${path} – ${exists ? 'bor' : 'yo‘q'}`)
  return exists
}
