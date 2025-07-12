// src/preload/index.js

const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')
const { exec } = require('child_process')
const { io } = require('socket.io-client')
const { networkInterfaces } = require('os')
const path = require('path')

// --- (Optional) Game icon uchun cache funksiyalari ---
let getGameIcon, deleteGameIcon
try {
  ({ getGameIcon, deleteGameIcon } = require('./utils/cacheGameIcon'))
} catch {}

// --- SOCKET ulash (faqat kerak bo‘lsa) ---
const socket = io('http://127.0.0.1:3000', {
  transports: ['websocket'],
  reconnection: true
})

// MAC manzil olish
function getMacAddress() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (
        !net.internal &&
        net.mac &&
        net.mac !== '00:00:00:00:00:00' &&
        net.family === 'IPv4'
      ) {
        return net.mac
      }
    }
  }
  return '00:00:00:00:00:00'
}

// O‘yin ishga tushirish
function runGame(gamePath) {
  exec(`"${gamePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Game start error:', error.message)
      return
    }
    if (stderr) {
      console.warn('⚠️ Game stderr:', stderr)
      return
    }
    console.log('✅ Game output:', stdout)
  })
}

// ICON (frontend uchun)
function getGameIconForUI(exePath) {
  if (!getGameIcon) return '/icons/default.png'
  const iconFile = getGameIcon(exePath)
  if (!iconFile) return '/icons/default.png'
  const filename = path.basename(iconFile)
  return `/icons/${filename}`
}
function deleteGameIconForUI(exePath) {
  if (deleteGameIcon) deleteGameIcon(exePath)
}

// ==== API obyekt: frontend uchun hamma IPC va funksiya ====
const api = {
  // Socket funksiyalar
  socket: {
    on: (...args) => socket.on(...args),
    once: (...args) => socket.once(...args),
    off: (...args) => socket.off(...args),
    emit: (...args) => socket.emit(...args),
    connected: () => socket.connected,
    id: () => socket.id
  },
  // Boshqa util/funksiyalar
  runGame,
  getMac: getMacAddress,
  getGameIcon: getGameIconForUI,
  deleteGameIcon: deleteGameIconForUI,
  // CRUD uchun universal invoke
  invoke: (...args) => ipcRenderer.invoke(...args),
  // Rasm yuklash uchun
  copyImageFile: (srcPath) => ipcRenderer.invoke('copyImageFile', srcPath)
}

// Expose to window.api
try {
  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } else {
    window.electron = electronAPI
    window.api = api
  }
} catch (err) {
  console.error('❌ Preload expose error:', err)
}
