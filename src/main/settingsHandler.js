export function registerSettingsHandlers(io = null) {
  ipcMain.handle('get-owner-password', () => getOwnerPassword())
  ipcMain.handle('set-owner-password', (event, pass) => setOwnerPassword(pass))

  if (io) {
    io.on('connection', (socket) => {
      socket.on('check-owner-password', async ({ password }, callback) => {
        try {
          const correctPassword = await getOwnerPassword()
          callback({ ok: password === correctPassword })
        } catch (err) {
          console.error('Parol tekshirishda xatolik:', err)
          callback({ ok: false })
        }
      })
    })
  }
}
