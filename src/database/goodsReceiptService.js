// goodsReceiptService.js (yangi fayl)
import { db } from './db.js'

export function getAllGoodsReceipts() {
  return db.prepare('SELECT * FROM goods_receipts ORDER BY id DESC').all()
}



