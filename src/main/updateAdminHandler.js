// src/main/updateAdminHandler.js
import { ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { https } from 'follow-redirects'         // 👈 faqat shu o‘zgardi!
import { getUpdateDir } from './services/updateServiceForAdmin.js'

// Faylni serverdan yuklab olish (admin installer uchun)
ipcMain.handle('download-admin-installer', async (event, { url, fileName }) => {
  const saveDir = getUpdateDir('admin')
  const filePath = path.join(saveDir, fileName)
  await downloadFile(url, filePath)
  return { success: true, filePath }
})

// Admin update fayli bor-yo‘qligini tekshirish
ipcMain.handle('check-admin-update-file', async () => {
  const dir = getUpdateDir('admin')
  if (!fs.existsSync(dir)) return false
  // Faqat .exe fayllarni qidiramiz
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.exe'))
  return files.length > 0
})

// Helper: Faylni yuklab olish (redirect bilan)
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(dest, () => {})
        return reject('Status ' + response.statusCode)
      }
      response.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err.message)
    })
  })
}

// Admin installer'ni ishga tushirish
ipcMain.handle('run-admin-update', async () => {
  const dir = getUpdateDir('admin')
  // .exe faylni topish (so‘nggi yuklangan)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.exe'))
  if (!files.length) return { success: false, error: 'Файл не найден' }

  const exePath = path.join(dir, files[0])
  // Windows-da exe faylni ochish:
  import('child_process').then(({ execFile }) => {
    execFile(exePath, (err) => {
      if (err) return { success: false, error: err.message }
    })
  })
  return { success: true }
})
