// src/database/barService.js
import { db } from './db.js'

// 1. Jadval yaratish
export function initBarTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      sell_price INTEGER DEFAULT 0,
      remain INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run()
}

// 2. Barcha mahsulotlar
export function getAllBarItems() {
  return db.prepare('SELECT * FROM bar_items ORDER BY id DESC').all()
}

// 3. Qo'shish
export function addBarItem({ name, image }) {
  return db.prepare(
    'INSERT INTO bar_items (name, image) VALUES (?, ?)'
  ).run(name, image)
}

// 4. Tahrirlash
export function updateBarItem({ id, name, image, sell_price }) {
  return db.prepare(
    'UPDATE bar_items SET name=?, image=?, sell_price=? WHERE id=?'
  ).run(name, image, sell_price ?? 0, id)
}

// 5. O‘chirish
export function deleteBarItem(id) {
  return db.prepare('DELETE FROM bar_items WHERE id=?').run(id)
}
