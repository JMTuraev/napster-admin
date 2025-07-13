// Electron asosiy modullari
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, basename } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// Electron Toolkit
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// DATABASE va SERVICE
import { db } from '../database/db.js'
import { initBarTable } from '../database/barService.js'
import { initOrderTable } from '../database/orderService.js'
import { initLevelsAndTabsAndGames } from '../database/gamesService.js'
import { initTimerTable } from '../database/timer.js'
import { initUserTable } from '../database/userService.js' // <<< YANGI

// HANDLERLAR
import { registerBarHandlers } from './barHandlers.js'
import { registerOrderHandlers } from './orderHandlers.js'
import { registerLevelPriceHandlers } from './levelPriceHandler.js'
import { registerTimerHandlers } from './timerHandler.js'

// SOCKET va QOLGAN handlerlar
import { startSocketServer } from './socketServer.js'
import { runGameHandler, checkPathExistsHandler, handleGameEvents } from './gameHandlers.js'
import { handleTabsEvents } from './tabsHandlers.js'
import './statusHandlers.js'

let io

function createWindow() {
  const mainWindow = new BrowserWindow({
    kiosk: false,
    alwaysOnTop: false,
    frame: true,
    fullscreen: false,
    closable: true,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      console.log('🔓 ESC bosildi – kiosk mode off')
      mainWindow.setKiosk(false)
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  // ==== JADVAL YARATISH ====
  initUserTable() // <--- users jadvali YARATISH
  initBarTable()
  initOrderTable()
  initLevelsAndTabsAndGames()
  initTimerTable()

  // ==== IPC HANDLERS ====
  // Signal test
  ipcMain.on('ping', () => console.log('pong'))

  // Foydalanuvchi qo‘shish va olish
  ipcMain.handle('add-user', (event, user) => {
    const now = new Date().toISOString()
    const exists = db.prepare('SELECT * FROM users WHERE mac = ?').get(user.mac)
    const defaultStatus = 'online'
    if (!exists) {
      db.prepare(`
        INSERT INTO users (mac, number, status, created_at)
        VALUES (?, NULL, ?, ?)
      `).run(user.mac, defaultStatus, now)
      return { status: 'added', mac: user.mac }
    } else {
      db.prepare(`UPDATE users SET status = ? WHERE mac = ?`).run(defaultStatus, user.mac)
      return { status: 'updated', mac: user.mac }
    }
  })

  ipcMain.handle('get-users', () =>
    db.prepare('SELECT * FROM users ORDER BY number ASC').all()
  )

  // ==== YANGI: IMAGE COPY IPC HANDLER ====
  ipcMain.handle('copyImageFile', (event, srcPath) => {
    try {
      if (!srcPath) return ''
      const fileName = Date.now() + '_' + basename(srcPath)
      const destDir = join(process.cwd(), 'src', 'renderer', 'public', 'images')
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
      const destPath = join(destDir, fileName)
      copyFileSync(srcPath, destPath)
      return '/images/' + fileName // Front uchun public path
    } catch (e) {
      console.error('[copyImageFile]', e)
      return ''
    }
  })

  // ==== MODULLAR IPC HANDLARLARNI ULASH ====
  registerBarHandlers()
  registerOrderHandlers()
  registerLevelPriceHandlers()
  registerTimerHandlers(io)

  // ==== GAMES, SOCKET va TIMER HANDLERS ====
  ipcMain.handle('run-game', runGameHandler)
  ipcMain.handle('check-path-exists', checkPathExistsHandler)

  io = startSocketServer()
  io.on('connection', (socket) => {
    console.log('📡 Yangi client ulandi')
    handleGameEvents(socket, io)
    handleTabsEvents(socket, io)
  })

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
