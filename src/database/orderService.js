// src/database/orderService.js
import { db } from './db.js'

export function initOrderTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER,
      stol INTEGER,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Не оплачен',
      date TEXT,
      FOREIGN KEY (item_id) REFERENCES bar_items(id)
    );
  `).run()
}

// CRUD funksiyalari:
export function getAllOrders() {
  return db.prepare('SELECT * FROM bar_orders ORDER BY id DESC').all()
}

export function addOrder(order) {
  return db.prepare(
    'INSERT INTO bar_orders (item_id, stol, quantity, price, status, date) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(order.item_id, order.stol, order.quantity, order.price, order.status, order.date)
}

export function updateOrderStatus({ id, status }) {
  return db.prepare('UPDATE bar_orders SET status=? WHERE id=?').run(status, id)
}
