import { ipcMain } from 'electron'
import { getOwnerPassword, setOwnerPassword } from '../database/settingsService.js'

export function registerSettingsHandlers(io = null) {
  // 🔐 IPC orqali frontenddan invoke chaqiruvlar
  ipcMain.handle('get-owner-password', async () => {
    return await getOwnerPassword()
  })

  ipcMain.handle('set-owner-password', async (event, pass) => {
    try {
      await setOwnerPassword(pass)
      return { success: true }
    } catch (err) {
      console.error('❌ Parolni saqlashda xatolik:', err)
      return { success: false, message: err.message }
    }
  })

  // 🔌 Socket.io orqali real vaqtli tekshirish
  if (io) {
    io.on('connection', (socket) => {
      socket.on('check-owner-password', async ({ password }, callback) => {
        try {
          const correctPassword = await getOwnerPassword()
          const ok = password === correctPassword
          callback({ ok })
        } catch (err) {
          console.error('❌ Parol tekshirishda xatolik:', err)
          callback({ ok: false })
        }
      })
    })
  }
}
