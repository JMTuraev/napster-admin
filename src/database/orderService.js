import { db } from './db.js'

/** 1. Cheklar (zakazlar) jadvali **/
export function initOrderTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stol INTEGER,
      status TEXT NOT NULL DEFAULT 'Не оплачен',
      total INTEGER DEFAULT 0,
      date TEXT
    );
  `).run()
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      item_id INTEGER,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES bar_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES bar_items(id)
    );
  `).run()
}

/** 2. Barcha buyurtmalarni olish (cheklar + itemlar bilan) */
export function getAllOrders() {
  // Har bir order uchun itemlar join qilinadi
  const orders = db.prepare('SELECT * FROM bar_orders ORDER BY id DESC').all()
  const getItems = db.prepare(`
    SELECT oi.*, bi.name, bi.image
    FROM bar_order_items oi
    LEFT JOIN bar_items bi ON oi.item_id = bi.id
    WHERE oi.order_id = ?
  `)
  return orders.map(order => ({
    ...order,
    items: getItems.all(order.id)
  }))
}

/** 3. Yangi buyurtma (1 ta chek + bir nechta item) */
export function addOrder({ stol = 0, items = [], status = 'Не оплачен', date = new Date().toLocaleString() }) {
  if (!items.length) throw new Error('Buyurtma uchun kamida 1 ta tovar tanlang!')
  // total narx hisoblash
  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const info = db.prepare(
    `INSERT INTO bar_orders (stol, status, total, date) VALUES (?, ?, ?, ?)`
  ).run(stol, status, total, date)
  const order_id = info.lastInsertRowid

  const insertItem = db.prepare(`
    INSERT INTO bar_order_items (order_id, item_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `)
  for (const it of items) {
    insertItem.run(order_id, it.item_id, it.quantity, it.price)
  }
  return { order_id, total }
}

/** 4. Statusni yangilash */
export function updateOrderStatus({ id, status }) {
  if (!id || !status) throw new Error('ID va yangi status kerak!')
  return db.prepare('UPDATE bar_orders SET status = ? WHERE id = ?').run(status, id)
}
