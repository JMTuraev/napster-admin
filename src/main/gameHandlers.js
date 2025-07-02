import fs from 'fs'
import { execFile } from 'child_process'
import { addGame, getAllGames, db } from '../database/db.js'
import { basename } from 'path'

// 🟢 Socket orqali ishlaydigan eventlar
export function handleGameEvents(socket, io) {
  // ✅ O‘yin qo‘shish
  socket.on('add-game', (data) => {
    try {
      const rawPath = data?.path
      if (!rawPath || typeof rawPath !== 'string') {
        throw new Error('Yuborilgan path noto‘g‘ri yoki mavjud emas')
      }

      const path = rawPath.trim()
      if (!path.includes('\\') || !path.toLowerCase().endsWith('.exe')) {
        throw new Error('Path noto‘g‘ri: unda .exe yoki \\ belgisi yo‘q')
      }

      const allGames = getAllGames()
      const alreadyExists = allGames.some((g) => g.path === path)
      if (alreadyExists) {
        console.log('⚠️ O‘yin oldin qo‘shilgan:', path)
        socket.emit('game-add-result', { status: 'exists', path })
        return
      }

      const exe = basename(path)
      const name = exe.replace('.exe', '')
      const game = { name, exe, path }

      addGame(game)
      console.log('✅ O‘yin qo‘shildi:', game)

      const updatedGames = getAllGames()
      io.emit('games', updatedGames) // 🔁 Barcha foydalanuvchilarga yangilanish
      socket.emit('game-add-result', { status: 'added', game })
    } catch (err) {
      console.error('❌ O‘yin qo‘shishda xato:', err.message)
      socket.emit('game-add-result', { status: 'error', message: err.message })
    }
  })

  // ✅ Foydalanuvchi o‘yinlar so‘raganda
  socket.on('get-games', () => {
    try {
      const games = getAllGames()
      socket.emit('games', games)
      console.log('📤 O‘yinlar yuborildi:', games)
    } catch (err) {
      console.error('❌ O‘yinlar olishda xatolik:', err.message)
      socket.emit('games', [])
    }
  })

  // ✅ O‘yinni o‘chirish
  socket.on('delete-game', (id) => {
    if (!id) return
    try {
      db.prepare('DELETE FROM games WHERE id = ?').run(id)
      console.log('🗑 O‘yin o‘chirildi:', id)

      const updatedGames = getAllGames()
      io.emit('games', updatedGames) // 🔁 Real-time yangilanish
      socket.emit('game-deleted', { status: 'ok', id })
    } catch (err) {
      console.error('❌ O‘yin o‘chirishda xatolik:', err.message)
      socket.emit('game-deleted', { status: 'error', message: err.message })
    }
  })
}

// 🟢 IPC orqali o‘yinni ishga tushirish
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

// 🟢 IPC orqali path mavjudligini tekshirish
export async function checkPathExistsHandler(event, path) {
  const exists = fs.existsSync(path)
  console.log(`📦 Path tekshirildi: ${path} – ${exists ? 'bor' : 'yo‘q'}`)
  return exists
}
