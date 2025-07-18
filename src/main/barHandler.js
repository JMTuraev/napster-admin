// src/main/barHandler.js
import { ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import {
  getAllBarItems,
  addBarItem,
  updateBarItem,
  deleteBarItem
} from '../database/barService.js'

// Bar productlar uchun IPC handlerlar
export function registerBarHandlers() {
  ipcMain.handle('bar-items/get', () => getAllBarItems())

  ipcMain.handle('bar-items/add', (event, data) => addBarItem(data))

  ipcMain.handle('bar-items/update', (event, data) => updateBarItem(data))

  ipcMain.handle('bar-items/delete', (event, id) => deleteBarItem(id))

  // Rasmni projectsBar ichiga ko‘chirib, path qaytaradi
  ipcMain.handle('copyImageFile', async (event, fileObj) => {
  try {
    if (!fileObj || !fileObj.base64) return ''
    const matches = /^data:.+\/(.+);base64,(.*)$/.exec(fileObj.base64)
    const ext = matches ? matches[1] : 'png'
    const data = matches ? matches[2] : ''
    const fileName = Date.now() + '_' + (fileObj.name || 'img') + '.' + ext
    const destDir = join(process.cwd(), 'src', 'renderer', 'public', 'images')
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
    const destPath = join(destDir, fileName)
    writeFileSync(destPath, Buffer.from(data, 'base64'))
    return '/images/' + fileName // Front uchun public path
  } catch (e) {
    console.error('[copyImageFile]', e)
    return ''
  }
})
}
