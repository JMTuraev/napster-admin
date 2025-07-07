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
 * Bu funksiya main processda Faqat BIR MARTA chaqilishi kerak!
 */
export function registerTimerHandlers() {
  // 1. Faol timerlar (lockscreen yoki monitoring uchun)
  ipcMain.handle('get-active-timers', () => getActiveTimers())

  // 2. Bir kompyuterning oxirgi (eng so‘nggi) timerni olish
  ipcMain.handle('get-latest-timer', (event, mac) => getLatestTimerByMac(mac))

  // 3. Yangi timer boshlash (timer ochiladi, eski "running" tugatiladi)
  ipcMain.handle('start-timer', (event, data) => {
    try {
      if (!data.mac || !data.duration || data.duration <= 0) {
        throw new Error('Mac va duration to‘g‘ri berilishi shart')
      }
      const result = startTimer(data)
      return { success: true, id: result.lastInsertRowid }
    } catch (e) {
      console.error('❌ Timer boshlashda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // 4. Timer tugatish (timerId orqali)
  ipcMain.handle('stop-timer', (event, id) => {
    try {
      stopTimer(id)
      return { success: true }
    } catch (e) {
      console.error('❌ Timer tugatishda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // 5. Timer tugatish (MAC orqali oxirgi "running" ni topib tugatadi)
  ipcMain.handle('stop-timer-by-mac', (event, mac) => {
    try {
      const latest = getLatestTimerByMac(mac)
      if (latest?.status === 'running') {
        stopTimer(latest.id)
        return { success: true }
      }
      return { success: false, message: 'Faol timer topilmadi' }
    } catch (e) {
      console.error('❌ stop-timer-by-mac xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // 6. Timerga vaqt qo‘shish (uzaytirish, yangi row)
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

  // 7. Statistika — barcha timerlar (masalan, admin uchun)
  ipcMain.handle('get-all-timers', () => getAllTimers())
}
