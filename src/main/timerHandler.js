// src/main/handlers/timerHandler.js

import { ipcMain } from 'electron'
import {
  getActiveTimers,
  getLatestTimerByMac,
  startTimer,
  stopTimer,
  getAllTimers,
  updateTimerDuration
} from '../database/timer.js'

export function registerTimerHandlers() {
  // 🔄 Faol timerlar
  ipcMain.handle('get-active-timers', async () => {
    return await getActiveTimers()
  })

  // 🔄 Oxirgi session (kompyuter bo‘yicha)
  ipcMain.handle('get-latest-timer', async (event, mac) => {
    return await getLatestTimerByMac(mac)
  })

  // ▶️ Yangi timer boshlash — ASYNC versiya
  ipcMain.handle('start-timer', async (event, data) => {
    try {
      const result = await startTimer(data) // ← asinxron chaqirish kerak
      return { success: true, id: result.lastInsertRowid }
    } catch (e) {
      console.error('❌ Timer boshlashda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // ⏹ Timer tugatish (ID orqali)
  ipcMain.handle('stop-timer', async (event, id) => {
    try {
      await stopTimer(id)
      return { success: true }
    } catch (e) {
      console.error('❌ Timer tugatishda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // ⏹ Timer tugatish (MAC orqali)
  ipcMain.handle('stop-timer-by-mac', async (event, mac) => {
    try {
      const latest = await getLatestTimerByMac(mac)
      if (latest?.status === 'running') {
        await stopTimer(latest.id)
        return { success: true }
      }
      return { success: false, message: 'Faol timer topilmadi' }
    } catch (e) {
      console.error('❌ stop-timer-by-mac xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // ➕ Timerga vaqt qo‘shish
  ipcMain.handle('add-time-to-timer', async (event, { mac, minutes }) => {
    try {
      const latest = await getLatestTimerByMac(mac)
      if (!latest || latest.status !== 'running') {
        return { success: false, message: 'Faol timer topilmadi' }
      }

      const newDuration = latest.duration + minutes
      await updateTimerDuration(latest.id, newDuration)

      return { success: true, newDuration }
    } catch (e) {
      console.error('❌ Vaqt qo‘shishda xatolik:', e)
      return { success: false, error: e.message }
    }
  })

  // 🧾 Barcha tarix
  ipcMain.handle('get-all-timers', async () => {
    return await getAllTimers()
  })
}
