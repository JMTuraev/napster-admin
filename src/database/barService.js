import { db } from './db.js'

// --- 1. Jadval yaratish (order_index bilan) ---
export function initBarTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      remain INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      order_index INTEGER NOT NULL DEFAULT 0
    );
  `).run()
}

// --- 2. CRUD FUNKSIYALAR ---

// Barcha itemlarni tartib bilan olish (menu user/admin uchun)
export function getAllBarItems() {
  return db.prepare('SELECT * FROM bar_items ORDER BY order_index ASC, id ASC').all()
}

// Qo'shish (order_index eng oxiriga, avtomatik)
export function addBarItem({ name, price, remain, image }) {
  const maxOrder = db.prepare('SELECT MAX(order_index) as maxOrder FROM bar_items').get().maxOrder ?? 0
  return db.prepare(
    'INSERT INTO bar_items (name, price, remain, image, order_index) VALUES (?, ?, ?, ?, ?)'
  ).run(name, price, remain, image, maxOrder + 1)
}

// Tahrirlash
export function updateBarItem({ id, name, price, remain, image }) {
  return db.prepare(
    'UPDATE bar_items SET name=?, price=?, remain=?, image=? WHERE id=?'
  ).run(name, price, remain, image, id)
}

// O'chirish
export function deleteBarItem(id) {
  return db.prepare('DELETE FROM bar_items WHERE id=?').run(id)
}

// Drag-drop dan keyin tartibni yangilash (massiv bilan)
export function updateBarItemsOrder(orderList) {
  const stmt = db.prepare('UPDATE bar_items SET order_index = ? WHERE id = ?')
  const tx = db.transaction((list) => {
    for (const { id, order_index } of list) {
      stmt.run(order_index, id)
    }
  })
  tx(orderList)
}

// Faqat bitta item tartibini o'zgartirish
export function updateBarItemOrder(id, order_index) {
  return db.prepare('UPDATE bar_items SET order_index=? WHERE id=?').run(order_index, id)
}

// Qoldiqni kamaytirish
export function decreaseRemain({ id, qty }) {
  return db.prepare('UPDATE bar_items SET remain = MAX(0, remain - ?) WHERE id=?').run(qty, id)
}

// Qoldiqni orttirish
export function increaseRemain({ id, qty }) {
  return db.prepare('UPDATE bar_items SET remain = remain + ? WHERE id=?').run(qty, id)
}

// Hammasini o'chirish (test/initial uchun)
export function clearBarItems() {
  return db.prepare('DELETE FROM bar_items').run()
}
