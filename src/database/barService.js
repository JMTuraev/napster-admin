import { db } from './db.js'

// 1. Jadval yaratish (buy_price, remain kiritildi)
export function initBarTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      sell_price INTEGER DEFAULT 0,
      buy_price INTEGER DEFAULT 0,
      remain INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run()
}

// 2. Barcha mahsulotlar
export function getAllBarItems() {
  return db.prepare('SELECT * FROM bar_items ORDER BY id DESC').all()
}

// 3. Qo‘shish
export function addBarItem({ name, image, sell_price = 0, buy_price = 0, remain = 0 }) {
  return db.prepare(
    'INSERT INTO bar_items (name, image, sell_price, buy_price, remain) VALUES (?, ?, ?, ?, ?)'
  ).run(name, image, sell_price, buy_price, remain)
}

// 4. Tahrirlash
export function updateBarItem({ id, name, image, sell_price, buy_price, remain }) {
  return db.prepare(
    'UPDATE bar_items SET name=?, image=?, sell_price=?, buy_price=?, remain=? WHERE id=?'
  ).run(name, image, sell_price ?? 0, buy_price ?? 0, remain ?? 0, id)
}

// 5. Faqat buy_price va remain-ni alohida yangilash (приходda ishlatish uchun)
export function updateBuyPriceAndRemain({ id, buy_price, remain }) {
  return db.prepare(
    'UPDATE bar_items SET buy_price=?, remain=? WHERE id=?'
  ).run(buy_price ?? 0, remain ?? 0, id)
}

// 6. O‘chirish
export function deleteBarItem(id) {
  return db.prepare('DELETE FROM bar_items WHERE id=?').run(id)
}

// 7. Bir dona mahsulotni olish
export function getBarItemById(id) {
  return db.prepare('SELECT * FROM bar_items WHERE id=?').get(id)
}
