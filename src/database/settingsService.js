// src/database/settingsService.js
import { db } from './db.js'

export function initSettingsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `).run()
}

export function getOwnerPassword() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('owner_password')
  return row ? row.value : ''
}

export function setOwnerPassword(pass) {
  db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES ('owner_password', ?)
  `).run(pass)
}
