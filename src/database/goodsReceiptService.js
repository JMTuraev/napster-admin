import { db } from './db.js'

// 1. Jadval yaratish (receipts va receipt_items)
export function initReceiptsTables() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT,          -- format: 00001, 00002, ...
      date TEXT,            -- optional, YYYY-MM-DD
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 0,
      buy_price INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES bar_items(id)
    );
  `).run()
}

// 2. Barcha prixodlarni olish (asosiy jadval, yig‘indi va mahsulotlar soni bilan)
export function getAllReceipts() {
  return db.prepare(`
    SELECT 
      r.id, r.number, r.date, r.created_at,
      COUNT(ri.id) AS products,
      IFNULL(SUM(ri.qty), 0) AS totalQty,
      IFNULL(SUM(ri.qty * ri.buy_price), 0) AS totalSum
    FROM receipts r
    LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
    GROUP BY r.id
    ORDER BY r.id DESC
  `).all()
}

// 3. Yangi prixod va receipt_items qo‘shish (transaction)
export function addReceipt({ number, date, items }) {
  const insertReceipt = db.prepare(
    'INSERT INTO receipts (number, date) VALUES (?, ?)'
  )
  const insertItem = db.prepare(
    'INSERT INTO receipt_items (receipt_id, product_id, qty, buy_price) VALUES (?, ?, ?, ?)'
  )
  const updateProduct = db.prepare(
    'UPDATE bar_items SET buy_price = ?, remain = remain + ? WHERE id = ?'
  )

  const transaction = db.transaction((number, date, items) => {
    // 1. receipts ga yoz
    const result = insertReceipt.run(number, date)
    const receipt_id = result.lastInsertRowid
    // 2. Har bir item uchun yozuv
    for (const item of items) {
      insertItem.run(receipt_id, item.product_id, item.qty, item.buy_price)
      updateProduct.run(item.buy_price, item.qty, item.product_id)
    }
    return receipt_id
  })

  return transaction(number, date, items)
}

// 4. Receipt tafsilotlari (items + product info)
export function getReceiptItems(receipt_id) {
  return db.prepare(`
    SELECT 
      ri.id, ri.product_id, ri.qty, ri.buy_price,
      b.name, b.image, b.sell_price
    FROM receipt_items ri
    JOIN bar_items b ON ri.product_id = b.id
    WHERE ri.receipt_id = ?
  `).all(receipt_id)
}

// 5. Bitta prixodni olish (asosiy info)
export function getReceiptById(id) {
  return db.prepare('SELECT * FROM receipts WHERE id = ?').get(id)
}

// 6. Receipt item-ni yangilash (tahrirlash, faqat qty va buy_price)
export function updateReceiptItem({ id, qty, buy_price }) {
  return db.prepare(`
    UPDATE receipt_items
    SET qty = ?, buy_price = ?
    WHERE id = ?
  `).run(qty, buy_price, id)
}

// 7. Receipt item-ni o‘chirish
export function deleteReceiptItem(id) {
  return db.prepare(`
    DELETE FROM receipt_items WHERE id = ?
  `).run(id)
}
