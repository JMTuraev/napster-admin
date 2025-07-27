import { db } from '../database/db.js'
import { getPcNumberUiSettings } from '../database/pcNumberUiService.js'

/**
 * Kompyuter raqami va font sozlamasini user.exe’ga yuborish (admin tomonidan)
 */
export function registerSendPcNumberUiHandler(socket, io) {
  // ⬅️ Qo‘lda yuborish: admin tugmani bossin
  socket.on('send-pc-number-ui-settings', () => {
    try {
      sendToAllUsers(io)
    } catch (err) {
      console.error('❌ [send-pc-number-ui-settings] Xatolik:', err.message)
    }
  })

  // 🆕 Avtomatik yuborish: client ulanayotganda
  socket.on('client-connected', (mac) => {
    try {
      sendToOneUser(io, mac)
    } catch (err) {
      console.error('❌ [client-connected] Xatolik:', err.message)
    }
  })
}

/**
 * Barcha user.exe’ga yuborish
 */
function sendToAllUsers(io) {
  const settings = getPcNumberUiSettings()
  const users = db.prepare('SELECT mac, number FROM users WHERE number IS NOT NULL').all()

  users.forEach(user => {
    io.emit(`receive-pc-ui-${user.mac}`, {
      show_number: !!settings.show_number,
      font_size: settings.font_size,
      number: user.number,
      mac: user.mac,
    })
  })

  console.log(`📡 [send-pc-number-ui-settings] ${users.length} ta user.exe'ga yuborildi`)
}

/**
 * Faqat bitta user.exe’ga yuborish (ulangan MAC bo‘yicha)
 */
function sendToOneUser(io, mac) {
  const user = db.prepare('SELECT number FROM users WHERE mac = ?').get(mac)
  const settings = getPcNumberUiSettings()

  if (!user || !user.number) return

  io.emit(`receive-pc-ui-${mac}`, {
    show_number: !!settings.show_number,
    font_size: settings.font_size,
    number: user.number,
    mac: mac,
  })

  console.log(`📤 [client-connected] PC number UI yuborildi: ${mac}`)
}
