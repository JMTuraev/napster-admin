import fs from 'fs'
import { execFile } from 'child_process'
import { addGameAutoIcon, getAllGames, db } from '../database/db.js'
import { basename, join } from 'path'

const iconsDir = join(process.cwd(), 'src', 'renderer', 'public', 'icons')

// 🟢 SOCKET handlerlari
export function handleGameEvents(socket, io) {
  // ✅ O‘yin qo‘shish (avtomatik icon bilan)
  socket.on('add-game', (data) => {
    try {
      const path = data?.path?.trim()
      if (!path || !path.toLowerCase().endsWith('.exe') || !path.includes('\\')) {
        throw new Error('Noto‘g‘ri path')
      }
      if (!fs.existsSync(path)) throw new Error('.exe fayli mavjud emas')

      const exists = getAllGames().some(g => g.path === path)
      if (exists) {
        socket.emit('game-add-result', { status: 'exists', path })
        return
      }

      const name = basename(path, '.exe')
      addGameAutoIcon({ name, exe: basename(path), path })

      const updatedGames = getAllGames()
      const addedGame = updatedGames.find(g => g.path === path)

      io.emit('games', updatedGames)
      socket.emit('game-add-result', { status: 'added', game: addedGame })

      console.log('✅ O‘yin muvaffaqiyatli qo‘shildi:', addedGame)
    } catch (err) {
      console.error('❌ O‘yin qo‘shishda xato:', err.message)
      socket.emit('game-add-result', { status: 'error', message: err.message })
    }
  })

  // ✅ O‘yinlar ro‘yxatini yuborish
  socket.on('get-games', () => {
    try {
      socket.emit('games', getAllGames())
      console.log('📤 O‘yinlar yuborildi')
    } catch (err) {
      console.error('❌ O‘yinlarni yuborishda xatolik:', err.message)
      socket.emit('games', [])
    }
  })

  // ✅ O‘yinni o‘chirish (icon bilan)
  socket.on('delete-game', (id) => {
    if (!id) return
    try {
      const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id)

      if (game?.icon && game.icon.startsWith('/icons/')) {
        const iconPath = join(iconsDir, game.icon.replace('/icons/', ''))
        if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath)
      }

      db.prepare('DELETE FROM games WHERE id = ?').run(id)

      const updatedGames = getAllGames()
      io.emit('games', updatedGames)
      socket.emit('game-deleted', { status: 'ok', id })

      console.log('🗑 O‘yin muvaffaqiyatli o‘chirildi:', id)
    } catch (err) {
      console.error('❌ O‘yin o‘chirishda xatolik:', err.message)
      socket.emit('game-deleted', { status: 'error', message: err.message })
    }
  })
}

// 🟢 IPC handlerlari
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
  console.log(`📦 Path tekshirildi: ${path} – ${exists ? 'mavjud' : 'yo‘q'}`)
  return exists
}
