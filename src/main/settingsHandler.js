import { ipcMain } from 'electron'
import { getOwnerPassword, setOwnerPassword } from '../database/settingsService.js'

export function registerSettingsHandlers(io = null) {
  // IPC handlerlar
  ipcMain.handle('get-owner-password', async () => {
    return await getOwnerPassword()
  })

  ipcMain.handle('set-owner-password', async (event, pass) => {
    try {
      await setOwnerPassword(pass)

      // === YANGI: Parolni socket orqali user.exe'ga yuboramiz ===
      if (io) {
        io.emit('update-owner-password', { password: pass })
        console.log('📡 Parol yangilandi, user.exe ga yuborildi:', pass)
      }

      return { success: true }
    } catch (err) {
      console.error('❌ Parolni saqlashda xatolik:', err)
      return { success: false, message: err.message }
    }
  })

  // Oldingi socket event
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
