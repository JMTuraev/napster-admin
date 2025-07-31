import fs from 'fs'
import path from 'path'

// 🔑 PATH’lar
const UPDATES_DIR = path.resolve('updates/user') // project rootdan nisbiy, root: admin.exe yonida

// 1. updates/user ni bo‘shatish
export function clearUserUpdatesFolder() {
  if (!fs.existsSync(UPDATES_DIR)) fs.mkdirSync(UPDATES_DIR, { recursive: true })
  for (const file of fs.readdirSync(UPDATES_DIR)) {
    fs.unlinkSync(path.join(UPDATES_DIR, file))
  }
}

// 2. Local faylni updates/user ga copy qilish
export function copyUserInstaller(localSourcePath, fileName = 'user-setup-latest.exe') {
  clearUserUpdatesFolder() // Eski fayllarni tozalash

  const destPath = path.join(UPDATES_DIR, fileName)
  fs.copyFileSync(localSourcePath, destPath)
  return destPath
}

// 3. (Kelajak uchun) Faylni serverdan yuklab olish (hozir ishlatmaymiz)
export function downloadUserInstaller(installerUrl, fileName = 'user-setup-latest.exe') {
  return new Promise((resolve, reject) => {
    clearUserUpdatesFolder()
    const destPath = path.join(UPDATES_DIR, fileName)
    const file = fs.createWriteStream(destPath)
    // https yoki http - URL ga qarab
    const protocol = installerUrl.startsWith('https') ? require('https') : require('http')
    protocol.get(installerUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('Fayl topilmadi yoki xatolik: ' + res.statusCode))
        return
      }
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve(destPath)))
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err))
    })
  })
}
