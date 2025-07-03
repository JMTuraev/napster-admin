// src/database/tabsService.js
import { db } from './db.js'  // db.js ichida better-sqlite3 bilan ulashganingizni faraz qilamiz

// DEFAULT 5 ta tab (agar bo‘lmasa) yaratish
export function ensureDefaultTabs() {
  const defaultTabs = [
    { id: 1, name: 'Action', sort_order: 1, empty: 1 },
    { id: 2, name: 'Arcade', sort_order: 2, empty: 1 },
    { id: 3, name: 'RPG', sort_order: 3, empty: 1 },
    { id: 4, name: 'Strategy', sort_order: 4, empty: 1 },
    { id: 5, name: 'Puzzle', sort_order: 5, empty: 1 }
  ]

  for (const tab of defaultTabs) {
    db.prepare(`
      INSERT OR IGNORE INTO tabs (id, name, sort_order, empty)
      VALUES (?, ?, ?, ?)
    `).run(tab.id, tab.name, tab.sort_order, tab.empty)
  }
}

// Bo‘sh tabsni yangilash
export function updateTabsEmpty() {
  const tabs = db.prepare('SELECT id FROM tabs').all()
  for (const tab of tabs) {
    const count = db.prepare('SELECT COUNT(*) AS c FROM games WHERE tabId = ?').get(tab.id).c
    // DEFAULT tab doim bo‘sh bo‘lmasligi kerak deb faraz qilamiz
    const emptyValue = (tab.id <= 5) ? 0 : (count === 0 ? 1 : 0)
    db.prepare('UPDATE tabs SET empty = ? WHERE id = ?').run(emptyValue, tab.id)
  }
}

// Tabs ro‘yxatini olish
export function getTabs() {
  updateTabsEmpty()
  return db.prepare('SELECT * FROM tabs ORDER BY sort_order ASC, id ASC').all()
}

// Yangi tab qo‘shish
export function addTab(name) {
  const countTabs = db.prepare('SELECT COUNT(*) AS c FROM tabs').get().c
  if (countTabs >= 5) {
    throw new Error('Maksimal 5 ta tab bo‘lishi mumkin')
  }

  // Oxirgi sort_order ni olish
  const lastSort = db.prepare('SELECT MAX(sort_order) AS maxSort FROM tabs').get().maxSort || 0

  db.prepare('INSERT INTO tabs (name, empty, sort_order) VALUES (?, 1, ?)').run(name || `New Tab`, lastSort + 1)

  return getTabs()
}

// Tab nomini o‘zgartirish
export function editTab(id, name) {
  if (!name || !name.trim()) {
    throw new Error('Tab nomi bo‘sh bo‘lishi mumkin emas')
  }

  db.prepare('UPDATE tabs SET name = ? WHERE id = ?').run(name.trim(), id)

  return getTabs()
}

// Tabni o‘chirish (faqat bo‘sh bo‘lsa va default tab bo‘lmasa)
export function deleteTab(id) {
  if (id <= 5) {
    throw new Error('Default tablarni o‘chirish mumkin emas')
  }

  const tab = db.prepare('SELECT empty FROM tabs WHERE id = ?').get(id)
  if (!tab) throw new Error('Tab topilmadi')

  if (tab.empty === 0) {
    throw new Error('Tab bo‘sh emas, o‘chirib bo‘lmaydi')
  }

  db.prepare('DELETE FROM tabs WHERE id = ?').run(id)

  return getTabs()
}
