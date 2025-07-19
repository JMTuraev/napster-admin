import { db } from './db.js'

// 1. Jadval yaratish (tab_id va sort_order qo‘shildi, tab_id ga default null)
export function initBarTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      sell_price INTEGER DEFAULT 0,
      buy_price INTEGER DEFAULT 0,
      remain INTEGER DEFAULT 0,
      tab_id INTEGER DEFAULT NULL,        -- qaysi tabga tegishli (kategoriya)
      sort_order INTEGER DEFAULT 0,       -- tartib raqami
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run()
}

// 2. Barcha mahsulotlar (tab_id va sort_order bo‘yicha tartiblangan)
export function getAllBarItems() {
  return db.prepare(
    'SELECT * FROM bar_items ORDER BY tab_id ASC, sort_order ASC, id ASC'
  ).all()
}

// 3. Faqat bir tab uchun mahsulotlar (optional)
export function getBarItemsByTab(tab_id) {
  return db.prepare(
    'SELECT * FROM bar_items WHERE tab_id = ? ORDER BY sort_order ASC, id ASC'
  ).all(tab_id)
}

// 4. Qo‘shish
export function addBarItem({
  name,
  image = '',
  sell_price = 0,
  buy_price = 0,
  remain = 0,
  tab_id = null,
  sort_order = 0
}) {
  return db.prepare(
    `INSERT INTO bar_items
      (name, image, sell_price, buy_price, remain, tab_id, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(name, image, sell_price, buy_price, remain, tab_id, sort_order)
}

// 5. Tahrirlash
export function updateBarItem({
  id,
  name,
  image = '',
  sell_price = 0,
  buy_price = 0,
  remain = 0,
  tab_id = null,
  sort_order = 0
}) {
  return db.prepare(
    `UPDATE bar_items
      SET name = ?, image = ?, sell_price = ?, buy_price = ?, remain = ?, tab_id = ?, sort_order = ?
      WHERE id = ?`
  ).run(name, image, sell_price, buy_price, remain, tab_id, sort_order, id)
}

// 6. Faqat tab_id va sort_order yangilash (drag/drop)
export function updateBarItemOrder({ id, tab_id, sort_order }) {
  return db.prepare(
    'UPDATE bar_items SET tab_id = ?, sort_order = ? WHERE id = ?'
  ).run(tab_id, sort_order, id)
}

// 7. Faqat buy_price va remain-ni alohida yangilash (приход uchun)
export function updateBuyPriceAndRemain({ id, buy_price, remain }) {
  return db.prepare(
    'UPDATE bar_items SET buy_price = ?, remain = ? WHERE id = ?'
  ).run(buy_price, remain, id)
}

// 8. O‘chirish
export function deleteBarItem(id) {
  return db.prepare('DELETE FROM bar_items WHERE id = ?').run(id)
}

// 9. Bir dona mahsulotni olish
export function getBarItemById(id) {
  return db.prepare('SELECT * FROM bar_items WHERE id = ?').get(id)
}
