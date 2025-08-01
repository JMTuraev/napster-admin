// 📁 src/main/services/downloadService.js

import fs from 'fs'
import path from 'path'
import { https, http } from 'follow-redirects' // ✅ follow-redirects paketidan foydalaniladi

// 🔑 PATH — admin.exe yonidagi updates/user papkasi
const UPDATES_DIR = path.resolve('updates/user')

// 1. updates/user ni bo‘shatish (eski fayllarni o‘chirish)
export function clearUserUpdatesFolder() {
  if (!fs.existsSync(UPDATES_DIR)) fs.mkdirSync(UPDATES_DIR, { recursive: true })
  for (const file of fs.readdirSync(UPDATES_DIR)) {
    fs.unlinkSync(path.join(UPDATES_DIR, file))
  }
}

// 2. Local faylni updates/user ga nusxalash
export function copyUserInstaller(localSourcePath, fileName = 'user-setup-latest.exe') {
  clearUserUpdatesFolder()
  const destPath = path.join(UPDATES_DIR, fileName)
  fs.copyFileSync(localSourcePath, destPath)
  return destPath
}

// 3. Uzoqdagi .exe faylni yuklab olish (CDN, GitHub Releases, va boshqalar uchun)
export function downloadUserInstaller(installerUrl, fileName = 'user-setup-latest.exe') {
  return new Promise((resolve, reject) => {
    clearUserUpdatesFolder()
    const destPath = path.join(UPDATES_DIR, fileName)
    const file = fs.createWriteStream(destPath)

    const protocol = installerUrl.startsWith('https') ? https : http

    protocol.get(installerUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('Fayl topilmadi yoki xatolik: ' + res.statusCode))
        return
      }

      res.pipe(file)

      file.on('finish', () => {
        file.close(() => {
          console.log('✅ Fayl saqlandi:', destPath)
          resolve(destPath)
        })
      })
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err))
    })
  })
}
