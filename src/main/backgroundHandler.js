import { dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import {
  insertBackground,
  getAllBackgrounds,
  deleteBackground,
  setSelectedBackground,
  getSelectedBackground
} from '../database/backgroundService.js'
import { emitBackgroundUpdate } from './socketServer.js'

// 🗂 Rasmlar saqlanadigan joy: public/backgrounds
const backgroundsPath = path.join(process.cwd(), 'public', 'backgrounds')
if (!fs.existsSync(backgroundsPath)) fs.mkdirSync(backgroundsPath, { recursive: true })

// 🌐 URL prefiks: public papkadagi fayllar vite orqali serve qilinadi
const PUBLIC_URL_PREFIX = 'http://192.168.1.10:5173/backgrounds/'

// 🔌 Barcha IPC handlerlar
export function registerBackgroundHandlers(io) {
  // ➕ Rasm tanlash
  ipcMain.handle('select-background-image', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Фонни танланг',
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
      properties: ['openFile']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const srcPath = result.filePaths[0]
      const fileName = `bg-${Date.now()}${path.extname(srcPath)}`
      const destPath = path.join(backgroundsPath, fileName)

      // Faylni nusxalash
      fs.copyFileSync(srcPath, destPath)

      // URL yaratish
      const publicUrl = `${PUBLIC_URL_PREFIX}${fileName}`

      // DBga yozish
      insertBackground(fileName, publicUrl)

      return { id: fileName, url: publicUrl }
    }

    return null
  })

  // 📥 Barcha fon rasm ma'lumotlari
  ipcMain.handle('get-background-images', async () => {
    return getAllBackgrounds()
  })

  // ❌ Rasmni o‘chirish
  ipcMain.handle('delete-background-image', async (_, fileName) => {
    const fullPath = path.join(backgroundsPath, fileName)
    try {
      fs.unlinkSync(fullPath)
    } catch (e) {
      console.warn('🟠 Fayl mavjud emas yoki allaqachon o‘chirilgan:', fullPath)
    }

    deleteBackground(fileName)
    return true
  })

  // ✅ Tanlangan fon
  ipcMain.handle('set-selected-background', async (_, { fileName, url }) => {
    setSelectedBackground(fileName)
    emitBackgroundUpdate({ url })
    return true
  })

  // 🔁 User.exe fonni so‘raganda
  ipcMain.handle('get-selected-background', async () => {
    return getSelectedBackground()
  })
}
