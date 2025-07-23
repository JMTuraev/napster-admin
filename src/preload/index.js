// src/preload/index.js

const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')
const { exec } = require('child_process')
const { io } = require('socket.io-client')
const { networkInterfaces } = require('os')
const path = require('path')

// --- Game icon uchun optional cache ---
let getGameIcon, deleteGameIcon
try {
  ({ getGameIcon, deleteGameIcon } = require('./utils/cacheGameIcon'))
} catch {}

// SOCKET (faqat kerak bo‘lsa)
const socket = io('http://192.168.1.10:3000', {
  transports: ['websocket'],
  reconnection: true
})

// --- Faqat faol Ethernet (yoki asosiy external) adapterning MAC adresini oladi ---
function getActiveEthernetMac() {
  const nets = networkInterfaces()
  // Avvalo: Ethernet/adabter nomi bo‘yicha prioritet
  for (const name of Object.keys(nets)) {
    if (!/ethernet|eth|en0|enp/i.test(name)) continue
    for (const net of nets[name]) {
      if (
        net.family === 'IPv4' &&
        !net.internal &&
        net.mac &&
        net.mac !== '00:00:00:00:00:00' &&
        net.address
      ) {
        return net.mac.toLowerCase()
      }
    }
  }
  // Fallback: birinchi external IPv4
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (
        net.family === 'IPv4' &&
        !net.internal &&
        net.mac &&
        net.mac !== '00:00:00:00:00:00' &&
        net.address
      ) {
        return net.mac.toLowerCase()
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

// ICON front uchun (Game)
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

// ==== API: Frontend uchun universal funksiyalar va IPC ====
const api = {
  // Socket
  socket: {
    on: (...args) => socket.on(...args),
    once: (...args) => socket.once(...args),
    off: (...args) => socket.off(...args),
    emit: (...args) => socket.emit(...args),
    connected: () => socket.connected,
    id: () => socket.id
  },
  runGame,
  getMac: getActiveEthernetMac,
  getGameIcon: getGameIconForUI,
  deleteGameIcon: deleteGameIconForUI,
  // IPC invoke universal: Bar va Order uchun
  invoke: (...args) => ipcRenderer.invoke(...args),
  // Rasm yuklash uchun (DB ga path yozish)
  copyImageFile: (fileObj) => ipcRenderer.invoke('copyImageFile', fileObj)
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
