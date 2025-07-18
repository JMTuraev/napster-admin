// src/main/barHandler.js
import { ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import {
  getAllBarItems,
  addBarItem,
  updateBarItem,
  deleteBarItem,
  updateBuyPriceAndRemain,
  getBarItemById
} from '../database/barService.js'

// Bar productlar uchun IPC handlerlar
export function registerBarHandlers() {
  // 1. Barcha mahsulotlar
  ipcMain.handle('bar-items/get', () => getAllBarItems())

  // 2. Qo'shish
  ipcMain.handle('bar-items/add', (event, data) => addBarItem(data))

  // 3. Tahrirlash
  ipcMain.handle('bar-items/update', (event, data) => updateBarItem(data))

  // 4. O‘chirish
  ipcMain.handle('bar-items/delete', (event, id) => deleteBarItem(id))

  // 5. Faqat buy_price va remain ni yangilash (приходda foydalanish uchun)
  ipcMain.handle('bar-items/update-buy-remain', (event, { id, buy_price, qty }) => {
    // Oldingi remain-ni olish va yangilash
    const item = getBarItemById(id)
    const newRemain = (item?.remain ?? 0) + (Number(qty) ?? 0)
    return updateBuyPriceAndRemain({ id, buy_price: Number(buy_price), remain: newRemain })
  })

  // 6. Приход batch qo‘shish (ko‘p mahsulot bir vaqtning o‘zida)
  ipcMain.handle('goods-receipt/add', async (event, { items }) => {
    for (const item of items) {
      // Har bir product uchun buy_price va remain-ni yangilash
      const { product_id, qty, buy_price } = item
      const existing = getBarItemById(product_id)
      const newRemain = (existing?.remain ?? 0) + (qty ?? 0)
      updateBuyPriceAndRemain({ id: product_id, buy_price, remain: newRemain })
    }
    return { ok: true }
  })

  // 7. Rasm yuklash (base64)
  ipcMain.handle('copyImageFile', async (event, fileObj) => {
    try {
      if (!fileObj || !fileObj.base64) return ''
      const matches = /^data:.+\/(.+);base64,(.*)$/.exec(fileObj.base64)
      const ext = matches ? matches[1] : 'png'
      const data = matches ? matches[2] : ''
      const fileName = Date.now() + '_' + (fileObj.name || 'img') + '.' + ext
      const destDir = join(process.cwd(), 'src', 'renderer', 'public', 'images')
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
      const destPath = join(destDir, fileName)
      writeFileSync(destPath, Buffer.from(data, 'base64'))
      return '/images/' + fileName // Front uchun public path
    } catch (e) {
      console.error('[copyImageFile]', e)
      return ''
    }
  })
}
