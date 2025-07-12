import fs from 'fs'
import { execFile } from 'child_process'
import { basename, join } from 'path'

// CRUD va xizmat funksiyalar gamesService.js dan import qilinadi
import { addGameAutoIcon, getAllGames } from '../database/gamesService.js'
// Faqat db instance kerak bo‘lsa, db.js dan:
import { db } from '../database/db.js'
const iconsDir = join(process.cwd(), 'src', 'renderer', 'public', 'icons')

// 🟢 SOCKET handlerlari
export function handleGameEvents(socket, io) {
  // O‘yin qo‘shish (icon bilan)
  socket.on('add-game', (data) => {
    try {
      const path = data?.path?.trim()
      /*
      if (!path || !path.toLowerCase().endsWith('.exe') || !path.includes('\\')) {
        throw new Error('Noto‘g‘ri path')
      }
*/      
      // ----- Quyidagi qator comment qilingan -----
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

  // O‘yinlar ro‘yxatini to‘liq yuborish (barcha ustunlar bilan)
  socket.on('get-games', (tabId) => {
    try {
      const validTabId = Number(tabId)
      const games = isNaN(validTabId)
        ? getAllGames()
        : getAllGames(validTabId)
      socket.emit('games', games)
      console.log(`📤 O‘yinlar userga yuborildi, tabId: ${validTabId}`)
    } catch (err) {
      console.error('❌ O‘yinlarni yuborishda xato:', err.message)
      socket.emit('games', [])
    }
  })

  // O‘yinning tabId sini o‘zgartirish
  socket.on('change-game-tab', ({ gameId, newTabId }) => {
    try {
      const maxOrderRow = db.prepare('SELECT MAX("order") as maxOrder FROM games WHERE tabId = ?').get(newTabId)
      const newOrder = (maxOrderRow?.maxOrder ?? -1) + 1

      db.prepare('UPDATE games SET tabId = ?, "order" = ? WHERE id = ?').run(newTabId, newOrder, gameId)
      const updatedGames = getAllGames()
      io.emit('games', updatedGames)
    } catch (e) {
      socket.emit('error', { message: e.message })
    }
  })

  // O‘yinlar tartibini yangilash (DRAG-DROP)
  socket.on('update-game-order', ({ tabId, order }) => {
    try {
      const updateStmt = db.prepare('UPDATE games SET "order" = ? WHERE id = ? AND tabId = ?')
      db.transaction(() => {
        order.forEach(({ id, order }) => {
          updateStmt.run(order, id, tabId)
        })
      })()

      const games = db.prepare('SELECT * FROM games WHERE tabId = ? ORDER BY "order", id').all(tabId)
      io.emit('games', games)
      socket.emit('game-order-updated', { status: 'ok' })
      console.log(`✅ O‘yinlar tartibi yangilandi: tabId ${tabId}`)
    } catch (err) {
      console.error('❌ O‘yinlar tartibini yangilashda xato:', err.message)
      socket.emit('order-update-error', { status: 'error', message: err.message })
    }
  })

  // O‘yinni o‘chirish (icon faylini ham o‘chirish)
  socket.on('delete-game', (id) => {
    if (!id) return
    try {
      const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id)

      // icon faylni ham o‘chir
      if (game?.icon && game.icon.startsWith('/icons/')) {
        const iconPath = join(iconsDir, game.icon.replace('/icons/', ''))
        if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath)
      }

      db.prepare('DELETE FROM games WHERE id = ?').run(id)

      // Shu tab uchun order ni qayta tartiblash
      const tabId = game?.tabId ?? 1
      const gamesInTab = db.prepare('SELECT id FROM games WHERE tabId = ? ORDER BY "order" ASC, id ASC').all(tabId)
      const updateOrder = db.prepare('UPDATE games SET "order" = ? WHERE id = ?')
      gamesInTab.forEach((g, idx) => updateOrder.run(idx, g.id))

      const updatedGames = getAllGames()
      io.emit('games', updatedGames)
      socket.emit('game-deleted', { status: 'ok', id })
      console.log('🗑 O‘yin muvaffaqiyatli o‘chirildi:', id)
    } catch (err) {
      console.error('❌ O‘yin o‘chirishda xato:', err.message)
      socket.emit('game-deleted', { status: 'error', message: err.message })
    }
  })
}

// 🟢 IPC handlerlari (renderer dan chaqiriladi)
export async function runGameHandler(_event, exePath) {
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

export async function checkPathExistsHandler(_event, path) {
  const exists = fs.existsSync(path)
  console.log(`📦 Path tekshirildi: ${path} – ${exists ? 'mavjud' : 'yo‘q'}`)
  return exists
}
