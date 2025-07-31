import fs from 'fs'
import path from 'path'

/**
 * User update faylini barcha user.exe'ga socket orqali yuborish
 * @param {import('socket.io').Server} io
 * @returns {object} {success, count, file, error}
 */
export function sendUserUpdate(io) {
  const UPDATES_DIR = path.resolve('updates/user')
  const files = fs.existsSync(UPDATES_DIR)
    ? fs.readdirSync(UPDATES_DIR).filter(f => f.endsWith('.exe'))
    : []

  if (files.length === 0) {
    console.error('[SOCKET-UPDATE] 🔴 No update file in updates/user/')
    return { success: false, error: 'No update file found' }
  }

  const fileName = files[0]
  const filePath = path.join(UPDATES_DIR, fileName)
  const fileData = fs.readFileSync(filePath).toString('base64')

  // Barcha user’ga faylni jo‘natamiz
  io.emit('receive-update', {
    fileName,
    fileData,
  })

  console.log(`[SOCKET-UPDATE] 🟢 Update file sent to users: ${fileName}`)
  return { success: true, count: 'ALL', file: fileName }
}
