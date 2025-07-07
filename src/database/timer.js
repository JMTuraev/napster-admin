// src/database/timer.js

import { db } from './db.js'

function initTimerTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS timers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      duration INTEGER,
      mode TEXT,
      price INTEGER,
      status TEXT DEFAULT 'running',
      parent_timer_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run()
}

function getActiveTimers() {
  return db.prepare(`
    SELECT * FROM timers WHERE status = 'running'
  `).all()
}

function getLatestTimerByMac(mac) {
  return db.prepare(`
    SELECT * FROM timers
    WHERE mac = ?
    ORDER BY start_time DESC
    LIMIT 1
  `).get(mac)
}

function startTimer({ mac, duration, mode = 'time', price = null, parent_timer_id = null }) {
  const now = new Date().toISOString()
  const running = db.prepare(`
    SELECT * FROM timers WHERE mac = ? AND status = 'running'
  `).get(mac)
  if (running) {
    db.prepare(`
      UPDATE timers SET status = 'finished', end_time = ?
      WHERE id = ?
    `).run(now, running.id)
  }
  return db.prepare(`
    INSERT INTO timers (mac, start_time, duration, mode, price, status, parent_timer_id, created_at)
    VALUES (?, ?, ?, ?, ?, 'running', ?, ?)
  `).run(mac, now, duration, mode, price, parent_timer_id, now)
}

function stopTimer(id, status = 'finished') {
  const endTime = new Date().toISOString()
  return db.prepare(`
    UPDATE timers
    SET status = ?, end_time = ?
    WHERE id = ?
  `).run(status, endTime, id)
}

function getAllTimers() {
  return db.prepare(`
    SELECT * FROM timers
    ORDER BY start_time DESC
  `).all()
}

function extendTimer({ mac, duration, mode = 'time', price = null, old_timer_id }) {
  stopTimer(old_timer_id, 'extended')
  return startTimer({
    mac,
    duration,
    mode,
    price,
    parent_timer_id: old_timer_id
  })
}

function findTimers({ mac, status }) {
  let q = 'SELECT * FROM timers WHERE 1=1'
  const params = []
  if (mac) {
    q += ' AND mac = ?'
    params.push(mac)
  }
  if (status) {
    q += ' AND status = ?'
    params.push(status)
  }
  q += ' ORDER BY start_time DESC'
  return db.prepare(q).all(...params)
}

// Faqat bitta eksport:
export {
  initTimerTable,
  getActiveTimers,
  getLatestTimerByMac,
  startTimer,
  stopTimer,
  getAllTimers,
  extendTimer,
  findTimers
}
