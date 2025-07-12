// src/database/barService.js
import { db } from './db.js'

export function initBarTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS bar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      remain INTEGER NOT NULL DEFAULT 0,
      image TEXT
    );
  `).run()
}

// CRUD funksiyalari:
export function getAllBarItems() {
  return db.prepare('SELECT * FROM bar_items ORDER BY id DESC').all()
}

export function addBarItem({ name, price, remain, image }) {
  return db.prepare(
    'INSERT INTO bar_items (name, price, remain, image) VALUES (?, ?, ?, ?)'
  ).run(name, price, remain, image)
}

export function updateBarItem({ id, name, price, remain, image }) {
  return db.prepare(
    'UPDATE bar_items SET name=?, price=?, remain=?, image=? WHERE id=?'
  ).run(name, price, remain, image, id)
}

export function deleteBarItem(id) {
  return db.prepare('DELETE FROM bar_items WHERE id=?').run(id)
}
