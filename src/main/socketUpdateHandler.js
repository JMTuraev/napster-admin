import fs from 'fs'
import path from 'path'

/**
 * User update faylini barcha user.exe'ga LINK orqali yuborish
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
  const LOCAL_SERVER_IP = '192.168.1.10' // ⚠️ IP ni o‘zingizga moslang
  const PORT = 3010
  const fileUrl = `http://${LOCAL_SERVER_IP}:${PORT}/updates/${encodeURIComponent(fileName)}`

  // 🔗 LINK YUBORILADI (fayl emas)
  io.emit('receive-update', {
    fileName,
    url: fileUrl
  })

  console.log(`[SOCKET-UPDATE] 🟢 Update link sent to users: ${fileUrl}`)
  return { success: true, count: 'ALL', file: fileName }
}
