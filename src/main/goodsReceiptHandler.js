// src/main/goodsReceiptHandler.js
import { ipcMain } from 'electron'
import { getAllGoodsReceipts } from '../database/goodsReceiptService.js'

// Приходlar uchun IPC handlerlar
export function registerGoodsReceiptHandlers() {
  ipcMain.handle('goods-receipt/list', () => getAllGoodsReceipts())
  // Kelajakda: goods-receipt/add, goods-receipt/delete va boshqalar ham shu yerga yoziladi
}
