// src/main/index.js

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { db } from '../database/db.js'
import { startSocketServer } from './socketServer.js'
import { runGameHandler, checkPathExistsHandler, handleGameEvents } from './gameHandlers.js'
import { handleTabsEvents } from './tabsHandlers.js'
import './statusHandlers.js'
import { registerLevelPriceHandlers } from './levelPriceHandler.js'
import { registerTimerHandlers } from './timerHandler.js'
import { initTimerTable } from '../database/timer.js'

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

  ipcMain.on('ping', () => console.log('pong'))

  // USER IPC HANDLERLAR
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
      db.prepare(`
        UPDATE users SET status = ? WHERE mac = ?
      `).run(defaultStatus, user.mac)
      return { status: 'updated', mac: user.mac }
    }
  })

  ipcMain.handle('get-users', () => {
    return db.prepare('SELECT * FROM users ORDER BY number ASC').all()
  })

  ipcMain.handle('run-game', runGameHandler)
  ipcMain.handle('check-path-exists', checkPathExistsHandler)

  // SOCKET va TIMER HANDLERS
  io = startSocketServer()
  io.on('connection', (socket) => {
    console.log('📡 Yangi client ulandi')
    handleGameEvents(socket, io)
    handleTabsEvents(socket, io)
  })

  initTimerTable()
  registerLevelPriceHandlers()
  registerTimerHandlers(io)  // <-- MUHIM!

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
