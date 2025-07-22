// src/main/timerHandler.js

import { ipcMain } from 'electron'
import {
  getActiveTimers,
  getLatestTimerByMac,
  startTimer,
  stopTimer,
  getAllTimers,
  extendTimer
} from '../database/timer.js'

/**
 * TIMER bilan bog‘liq barcha IPC handlerlarni ro‘yxatdan o‘tkazadi.
 * io obyektini param sifatida qabul qiladi!
 */
export function registerTimerHandlers(io) {
  console.log('[ADMIN] TIMER HANDLERS REGISTERED')

  ipcMain.handle('get-active-timers', () => getActiveTimers())

  ipcMain.handle('get-latest-timer', (event, mac) => getLatestTimerByMac(mac))

  ipcMain.handle('start-timer', (event, data) => {
    try {
      if (!data.mac || !data.duration || data.duration <= 0) {
        throw new Error('Mac va duration to‘g‘ri berilishi shart')
      }
      const result = startTimer(data)
      if (io && data.mac) {
        io.emit('unlock', data.mac)
        console.log('[SOCKET] UNLOCK yuborildi:', data.mac)
      }
      return { success: true, id: result.lastInsertRowid }
    } catch (e) {
      console.error('❌ Timer boshlashda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('stop-timer', (event, id) => {
    try {
      const timer = stopTimer(id)
      console.log('[DEBUG] stop-timer uchun timer:', timer)
      // STATUSGA QARAMASDAN: mac bor bo‘lsa, lock yubor!
      if (io && timer && timer.mac) {
        io.emit('lock', timer.mac)
        console.log('[SOCKET] LOCK yuborildi:', timer.mac)
      } else {
        console.log('[SOCKET] LOCK yuborilmadi, timer yoki mac yo‘q:', timer)
      }
      return { success: true }
    } catch (e) {
      console.error('❌ Timer tugatishda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('stop-timer-by-mac', (event, mac) => {
    try {
      const latest = getLatestTimerByMac(mac)
      // STATUSGA QARAMASDAN, timer topilsa lock yubor!
      if (latest && latest.id) {
        stopTimer(latest.id)
        if (io && mac) {
          io.emit('lock', mac)
          console.log('[SOCKET] LOCK yuborildi:', mac)
        }
        return { success: true }
      }
      return { success: false, message: 'Faol timer topilmadi' }
    } catch (e) {
      console.error('❌ stop-timer-by-mac xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('extend-timer', (event, { mac, minutes }) => {
    try {
      const latest = getLatestTimerByMac(mac)
      if (!latest || latest.status !== 'running') {
        return { success: false, message: 'Faol timer topilmadi' }
      }
      const extensionSec = parseInt(minutes) * 60
      extendTimer({
        mac,
        duration: extensionSec,
        mode: latest.mode,
        price: null,
        old_timer_id: latest.id
      })
      return { success: true }
    } catch (e) {
      console.error('❌ Timer extension xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-all-timers', () => getAllTimers())
}
