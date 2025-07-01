// src/database/timer.js

import { db } from './db.js'

/**
 * 📦 Jadvalni yaratish (bir martalik)
 */
export function initTimerTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS timers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      duration INTEGER,         -- sekundda (masalan: 3600)
      mode TEXT,                -- 'time', 'price', 'vip'
      price INTEGER,            -- agar price bo‘lsa
      status TEXT DEFAULT 'running'  -- 'running' | 'finished'
    )
  `).run()
}

/**
 * 🟢 Faol (ishlayotgan) sessionlar ro‘yxatini olish
 */
export function getActiveTimers() {
  return db.prepare(`
    SELECT * FROM timers WHERE status = 'running'
  `).all()
}

/**
 * 🟢 Muayyan kompyuterning eng so‘nggi sessiyasini olish
 */
export function getLatestTimerByMac(mac) {
  return db.prepare(`
    SELECT * FROM timers
    WHERE mac = ?
    ORDER BY start_time DESC
    LIMIT 1
  `).get(mac)
}

/**
 * 🟢 Yangi timer boshlash
 */
export function startTimer({ mac, start_time, duration, mode, price }) {
  // ⚠️ Undefined qiymatlarni to‘g‘rilaymiz
  if (price === undefined) price = null
  duration = parseInt(duration) || 0

  console.log('📥 TIMER INSERT:', {
    mac,
    start_time,
    duration,
    mode,
    price
  })

  return db.prepare(`
    INSERT INTO timers (mac, start_time, duration, mode, price, status)
    VALUES (?, ?, ?, ?, ?, 'running')
  `).run(mac, start_time, duration, mode, price)
}

/**
 * 🔴 Timer tugatish (status: finished va end_time qo‘yiladi)
 */
export function stopTimer(id) {
  const endTime = new Date().toISOString()
  return db.prepare(`
    UPDATE timers
    SET status = 'finished', end_time = ?
    WHERE id = ?
  `).run(endTime, id)
}

/**
 * 🟡 Timerga qo‘shimcha vaqt qo‘shish (duration yangilash)
 */
export function updateTimerDuration(id, newDuration) {
  return db.prepare(`
    UPDATE timers
    SET duration = ?
    WHERE id = ?
  `).run(newDuration, id)
}

/**
 * 🧾 Barcha timerlar tarixini olish (admin/statistika uchun)
 */
export function getAllTimers() {
  return db.prepare(`
    SELECT * FROM timers
    ORDER BY start_time DESC
  `).all()
}
