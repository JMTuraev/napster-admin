// src/main/goodsReceiptHandler.js
import { ipcMain } from 'electron'
import {
  getAllReceipts,
  addReceipt,
  getReceiptItems,
  updateReceiptItem,    // Qo‘shimcha: item tahrirlash funksiyasi
  deleteReceiptItem     // Qo‘shimcha: item o‘chirish funksiyasi
} from '../database/goodsReceiptService.js'

// Приходlar uchun IPC handlerlar
export function registerGoodsReceiptHandlers() {
  // Barcha prixodlarni olish
  ipcMain.handle('goods-receipt/list', async () => {
    try {
      return getAllReceipts()
    } catch (err) {
      console.error('[goods-receipt/list] xato:', err)
      return []
    }
  })

  // Bir prixod ichidagi mahsulotlarni olish
  ipcMain.handle('goods-receipt/items', async (event, receipt_id) => {
    try {
      return getReceiptItems(receipt_id)
    } catch (err) {
      console.error('[goods-receipt/items] xato:', err)
      return []
    }
  })

  // Yangi prixod (va items) qo‘shish
  ipcMain.handle('goods-receipt/add', async (event, { number, date, items }) => {
    try {
      return addReceipt({ number, date, items })
    } catch (err) {
      console.error('[goods-receipt/add] xato:', err)
      return { error: true }
    }
  })

  // --- YANGI: Item tahrirlash
  ipcMain.handle('goods-receipt/item/update', async (event, data) => {
    try {
      // data: { id, name, qty, buy_price }
      return await updateReceiptItem(data)
    } catch (err) {
      console.error('[goods-receipt/item/update] xato:', err)
      return { error: true }
    }
  })

  // --- YANGI: Item o‘chirish
  ipcMain.handle('goods-receipt/item/delete', async (event, id) => {
    try {
      return await deleteReceiptItem(id)
    } catch (err) {
      console.error('[goods-receipt/item/delete] xato:', err)
      return { error: true }
    }
  })
}
