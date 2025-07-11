const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')
const { exec } = require('child_process')
const { io } = require('socket.io-client')
const { networkInterfaces } = require('os')
const path = require('path')
const { getGameIcon, deleteGameIcon } = require('./utils/cacheGameIcon')

// SOCKET (o‘zgarmaydi)
const socket = io('http://127.0.0.1:3000', {
  transports: ['websocket'],
  reconnection: true
})

// MAC olish
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

// 🎮 O‘yin ishga tushirish
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

// ICON front uchun (ENG MUHIM QISM)
function getGameIconForUI(exePath) {
  const iconFile = getGameIcon(exePath) // bu E:\src\... yoki C:\... ni qaytaradi
  if (!iconFile) return '/icons/default.png'
  const filename = path.basename(iconFile)
  return `/icons/${filename}` // faqat public/icons/ dan ochiladi!
}

// ICON o‘chirish
function deleteGameIconForUI(exePath) {
  deleteGameIcon(exePath)
}

// API — frontendga expose qilinadi
const api = {
  socket: {
    on: (...args) => socket.on(...args),
    once: (...args) => socket.once(...args),
    off: (...args) => socket.off(...args),
    emit: (...args) => socket.emit(...args),
    connected: () => socket.connected,
    id: () => socket.id
  },
  runGame,
  getMac: getMacAddress,
  invoke: (...args) => ipcRenderer.invoke(...args),
  getGameIcon: getGameIconForUI,
  deleteGameIcon: deleteGameIconForUI
}

// Context isolation va window.api ni expose qilish
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
