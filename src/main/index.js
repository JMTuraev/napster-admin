import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 📦 DB: better-sqlite3 + CRUD funksiyalari
import db from './src/database/db.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    kiosk: false,
    alwaysOnTop: false,
    frame: true,
    fullscreen: false,
    closable: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 🔓 ESC bosilsa kiosk'dan chiqish (dev test)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      console.log('🔓 ESC bosildi – kiosk mode off');
      mainWindow.setKiosk(false);
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 🧠 IPC - foydalanuvchilar bilan ishlash
ipcMain.handle('add-user', (event, user) => {
  const exists = db.prepare('SELECT * FROM users WHERE mac = ?').get(user.mac)
  const now = new Date().toISOString()

  if (!exists) {
    db.prepare(`
      INSERT INTO users (mac, name, status, created_at)
      VALUES (?, ?, ?, ?)
    `).run(user.mac, user.name, user.status, now)
    return { status: 'added', user }
  } else {
    db.prepare(`
      UPDATE users SET name = ?, status = ? WHERE mac = ?
    `).run(user.name, user.status, user.mac)
    return { status: 'updated', user }
  }
})

ipcMain.handle('get-users', () => {
  return db.prepare('SELECT * FROM users').all()
})

// App start
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
