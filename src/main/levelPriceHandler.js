// src/main/handlers/levelPriceHandler.js

import { ipcMain } from 'electron'
import {
  getAllLevelPrices,
  insertOrUpdatePrice,
  getUsedLevelPrices // 🔥 yangi funksiya ishlatilayotgan level'lar uchun
} from '../database/levelPrices.js'

/**
 * 💼 Level narxlari bilan bog‘liq barcha IPC handlerlar shu yerda
 */
export function registerLevelPriceHandlers() {
  // 🔄 Barcha level'lar bo‘yicha narxlar
  ipcMain.handle('get-level-prices', () => {
    return getAllLevelPrices()
  })

  // 🔄 Faqat ishlatilayotgan level'lar bo‘yicha narxlar
  ipcMain.handle('get-used-level-prices', () => {
    return getUsedLevelPrices()
  })

  // 💾 Narx qo‘shish yoki yangilash
  ipcMain.handle('update-level-price', (event, { level_id, price }) => {
    try {
      insertOrUpdatePrice(level_id, price)
      return { success: true }
    } catch (err) {
      console.error('❌ Narx yangilashda xatolik:', err)
      return { success: false, error: err.message }
    }
  })
}
