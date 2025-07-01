// src/main/handlers/levelPriceHandler.js

import { ipcMain } from 'electron'
import {
  getAllLevelPrices,
  insertOrUpdatePrice,
  getUsedLevelPrices
} from '../database/levelPrices.js'

/**
 * 💼 Level narxlari bilan bog‘liq barcha IPC handlerlar shu yerda ro‘yxatdan o‘tkaziladi
 */
export function registerLevelPriceHandlers() {
  /**
   * 🔄 1. Barcha level'lar bo‘yicha narxlar (admin uchun)
   * Frontendda: window.api.invoke('get-level-prices')
   */
  ipcMain.handle('get-level-prices', async () => {
    try {
      const result = await getAllLevelPrices()
      return result
    } catch (err) {
      console.error('❌ get-level-prices xatolik:', err)
      return []
    }
  })

  /**
   * 🔄 2. Faqat ishlatilayotgan level_id lar bo‘yicha narxlar
   * Frontendda: window.api.invoke('get-used-level-prices')
   */
  ipcMain.handle('get-used-level-prices', async () => {
    try {
      const result = await getUsedLevelPrices()
      return result
    } catch (err) {
      console.error('❌ get-used-level-prices xatolik:', err)
      return []
    }
  })

  /**
   * 💾 3. Narx qo‘shish yoki yangilash
   * Frontendda: window.api.invoke('update-level-price', { level_id, price })
   */
  ipcMain.handle('update-level-price', async (event, { level_id, price }) => {
    try {
      await insertOrUpdatePrice(level_id, price)
      return { success: true }
    } catch (err) {
      console.error('❌ Narx yangilashda xatolik:', err)
      return { success: false, error: err.message }
    }
  })
}
