import fs from 'fs'
import { execFile } from 'child_process'
import { addGame, getAllGames, db } from '../database/db.js'
import { basename } from 'path'

export function handleGameEvents(socket, io) {
  // 🟢 O‘yin qo‘shish
  socket.on('add-game', (data) => {
    try {
      if (!data?.path || typeof data.path !== 'string') {
        throw new Error('Yuborilgan path noto‘g‘ri yoki mavjud emas')
      }

      const path = data.path.trim()
      if (!path.includes('\\') || !path.toLowerCase().includes('.exe')) {
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

      io.emit('new-game', game)
      socket.emit('game-add-result', { status: 'added', game })
    } catch (err) {
      console.error('❌ O‘yin qo‘shishda xato:', err.message)
      socket.emit('game-add-result', { status: 'error', message: err.message })
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

  // 🗑 O‘yinni o‘chirish
  socket.on('delete-game', (id) => {
    if (!id) return
    try {
      db.prepare('DELETE FROM games WHERE id = ?').run(id)
      console.log('🗑 O‘yin o‘chirildi:', id)

      const updated = getAllGames()
      io.emit('games', updated)
      socket.emit('game-deleted') // frontend yangilanishi uchun
    } catch (err) {
      console.error('❌ O‘yin o‘chirishda xatolik:', err.message)
    }
  })
}

// IPC orqali ishlovchilar
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
