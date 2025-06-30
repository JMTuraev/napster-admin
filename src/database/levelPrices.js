// src/database/levelPrices.js

import { db } from './db.js'

/**
 * ✅ level_prices jadvalini yaratish
 * Har bir level uchun 1 dona narx saqlanadi
 */
export function createLevelPriceTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS level_prices (
      level_id INTEGER PRIMARY KEY,
      price INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (level_id) REFERENCES levels(id)
    )
  `).run()
  console.log('✅ level_prices jadvali tayyor')
}

/**
 * 💾 Narx qo‘shish yoki yangilash
 * @param {number} level_id
 * @param {number} price
 */
export function insertOrUpdatePrice(level_id, price) {
  db.prepare(`
    INSERT INTO level_prices (level_id, price)
    VALUES (?, ?)
    ON CONFLICT(level_id) DO UPDATE SET price = excluded.price
  `).run(level_id, price)
  console.log(`💰 Narx saqlandi: level_id=${level_id}, price=${price}`)
}

/**
 * 🔍 Bitta level bo‘yicha narxni olish
 * @param {number} level_id
 * @returns {number|null}
 */
export function getPriceByLevel(level_id) {
  const row = db.prepare(`
    SELECT price FROM level_prices WHERE level_id = ?
  `).get(level_id)
  return row?.price ?? null
}

/**
 * 📋 Barcha level va narxlar
 * @returns {Array} [ { level_id, name, price } ]
 */
export function getAllLevelPrices() {
  return db.prepare(`
    SELECT levels.id AS level_id, levels.name, COALESCE(level_prices.price, 0) AS price
    FROM levels
    LEFT JOIN level_prices ON levels.id = level_prices.level_id
    WHERE levels.is_active = 1
    ORDER BY levels.id ASC
  `).all()
}

/**
 * ✅ Faqat ishlatilayotgan level_id lar bo‘yicha narxlar
 * Masalan, computers jadvalidagi mavjud level_id lar asosida
 */
export function getUsedLevelPrices() {
  return db.prepare(`
    SELECT DISTINCT levels.id AS level_id, levels.name, COALESCE(level_prices.price, 0) AS price
    FROM users
    JOIN levels ON users.level_id = levels.id
    LEFT JOIN level_prices ON levels.id = level_prices.level_id
    WHERE levels.is_active = 1
    ORDER BY levels.id ASC
  `).all()
}

// 🚀 Ilova ishga tushganda jadvalni tayyorlash
createLevelPriceTable()
