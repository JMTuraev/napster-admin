import { db } from './db.js'

// 1. Jadval yaratish (kategoriya, tablar uchun)
export function initTabsMenuTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tabs_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `).run()

  // Statik namunaviy tablar (agar yo‘q bo‘lsa)
  const exists = db.prepare('SELECT COUNT(*) as cnt FROM tabs_menu').get()
  if (exists.cnt === 0) {
    const tabs = [
      { name: 'Ichimliklar', sort_order: 1 },
      { name: 'Fast Food', sort_order: 2 },
      { name: 'Gazaklar', sort_order: 3 },
      { name: 'Shirinliklar', sort_order: 4 },
    ]
    for (const t of tabs) {
      db.prepare('INSERT INTO tabs_menu (name, sort_order) VALUES (?, ?)').run(t.name, t.sort_order)
    }
  }
}

// 2. Barcha tablarni olish
export function getAllTabsMenu() {
  return db.prepare('SELECT * FROM tabs_menu ORDER BY sort_order ASC').all()
}

// 3. Tab yangilash
export function updateTabsMenu({ id, name, sort_order }) {
  return db.prepare('UPDATE tabs_menu SET name=?, sort_order=? WHERE id=?').run(name, sort_order, id)
}

// 4. Yangi tab qo‘shish
export function addTabsMenu({ name, sort_order = 0 }) {
  return db.prepare('INSERT INTO tabs_menu (name, sort_order) VALUES (?, ?)').run(name, sort_order)
}

// 5. Tabni o‘chirish
export function deleteTabsMenu(id) {
  return db.prepare('DELETE FROM tabs_menu WHERE id=?').run(id)
}
