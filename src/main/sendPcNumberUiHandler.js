import { db } from '../database/db.js' // <-- ❗️db ni import qilish kerak
import { getPcNumberUiSettings } from '../database/pcNumberUiService.js'

/**
 * Kompyuter raqami va font sozlamasini barcha user.exe’ga yuborish
 */
export function registerSendPcNumberUiHandler(socket, io) {
  socket.on('send-pc-number-ui-settings', () => {
    try {
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
    } catch (err) {
      console.error('❌ [send-pc-number-ui-settings] Xatolik:', err.message)
    }
  })
}
