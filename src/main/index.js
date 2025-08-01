// src/main/index.js
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

// DATABASE va SERVICE INIT
import { db } from '../database/db.js'
import { initBarTable } from '../database/barService.js'
import { initReceiptsTables } from '../database/goodsReceiptService.js'
import { initLevelsAndTabsAndGames } from '../database/gamesService.js'
import { initTimerTable } from '../database/timer.js'
import { initUserTable } from '../database/userService.js'
import { initTabsMenuTable } from '../database/tabsMenuService.js'
import { initBackgroundTable } from '../database/backgroundService.js'
import { initPcNumberUiTable } from '../database/pcNumberUiService.js'
import { initSettingsTable } from '../database/settingsService.js'

// HANDLER IMPORTS
import { registerBarHandlers } from './barHandler.js'
import { registerGoodsReceiptHandlers } from './goodsReceiptHandler.js'
import { registerLevelPriceHandlers } from './levelPriceHandler.js'
import { registerTimerHandlers } from './timerHandler.js'
import { registerTabsMenuHandlers } from './tabsMenuHandler.js'
import { registerOrdersHandlers } from './ordersHandler.js'
import { handleUserStatusEvents } from './userStatusHandler.js'
import { registerBackgroundHandlers } from './backgroundHandler.js'
import { registerPcNumberUiHandlers } from './pcNumberUiHandler.js'
import { downloadUserInstaller } from './services/updateService.js'
import { startUpdateServer  } from './services/updateServer.js' // expres update versi yuborish uchun 
import { sendUserUpdate } from './socketUpdateHandler.js'

// SOCKET va QOLGAN handlerlar
import { startSocketServer } from './socketServer.js'
import { runGameHandler, checkPathExistsHandler, handleGameEvents } from './gameHandlers.js'
import { handleTabsEvents } from './tabsHandlers.js'
import './statusHandlers.js'
import { registerSettingsHandlers } from './settingsHandler.js'
import { registerSendPcNumberUiHandler } from './sendPcNumberUiHandler.js'

let io

function createWindow() {
  const mainWindow = new BrowserWindow({
    kiosk: false,
    alwaysOnTop: false,
    frame: true,
    title: 'Game Booking',
    fullscreen: false,
    closable: true,
    autoHideMenuBar: true,
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
  initUserTable()
  initBarTable()
  initReceiptsTables()
  initLevelsAndTabsAndGames()
  initTimerTable()
  initTabsMenuTable()
  initBackgroundTable()
  registerOrdersHandlers()
  initPcNumberUiTable()
  registerPcNumberUiHandlers()
  startUpdateServer()
  initSettingsTable()

  // ==== SOCKET SERVERNI BOSHLASH ====
  io = startSocketServer()

  // === MODULLAR SOCKET bilan ishlaydi ===
  registerBackgroundHandlers(io) // ✅ TO‘G‘RI joyga KO‘CHIRILDI
  registerTimerHandlers(io)
  registerSettingsHandlers(io)

  io.on('connection', (socket) => {
    console.log('📡 Yangi client ulandi')
    handleGameEvents(socket, io)
    handleTabsEvents(socket, io)
    handleUserStatusEvents(socket, io)
    registerSendPcNumberUiHandler(socket, io)
  })

  // ==== IPC HANDLERS (core system) ====
  ipcMain.on('ping', () => console.log('pong'))

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

  registerBarHandlers()
  registerGoodsReceiptHandlers()
  registerLevelPriceHandlers()
  registerTabsMenuHandlers()

  ipcMain.handle('run-game', runGameHandler)
  ipcMain.handle('check-path-exists', checkPathExistsHandler)

  
// Update fayl bor-yo‘qligini tekshirish
ipcMain.handle('check-update-file', async () => {
  const updatesDir = path.resolve('updates/user')
  if (!fs.existsSync(updatesDir)) return false
  return fs.readdirSync(updatesDir).some((f) => f.endsWith('.exe'))
})

// Userlarga update faylni socket orqali yuborish
ipcMain.handle('send-user-update', async () => {
  return sendUserUpdate(io)
})

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})





ipcMain.handle('download-user-installer', async (event, { url, fileName }) => {
  try {
    return await downloadUserInstaller(url, fileName)
  } catch (err) {
    // Xatolikni frontendga qaytarish
    throw new Error(err.message || 'Yuklashda nomaʼlum xatolik')
  }
})