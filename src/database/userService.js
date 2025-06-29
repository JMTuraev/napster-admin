import db from './db.js'

export function addOrUpdateUser(user) {
  const exists = db.prepare('SELECT * FROM users WHERE mac = ?').get(user.mac)
  const now = new Date().toISOString()

  if (!exists) {
    db.prepare(`
      INSERT INTO users (mac, name, status, created_at)
      VALUES (?, ?, ?, ?)
    `).run(user.mac, user.name, user.status, now)
    return { status: 'added', user }
  } else {
    db.prepare(`
      UPDATE users SET name = ?, status = ? WHERE mac = ?
    `).run(user.name, user.status, user.mac)
    return { status: 'updated', user }
  }
}

export function getAllUsers() {
  return db.prepare('SELECT * FROM users').all()
}
