// src/preload/index.js

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { exec } from 'child_process'
import { io } from 'socket.io-client'
import { networkInterfaces } from 'os'

// 📡 SOCKET ulanish (localhost:3000)
const socket = io('http://127.0.0.1:3000', {
  transports: ['websocket'],
  reconnection: true
})

// 🎮 O‘yin ishga tushirish funksiyasi
function runGame(path) {
  exec(`"${path}"`, (error, stdout, stderr) => {
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

// 🧠 MAC manzilni olish (asosiy network interfeysdan)
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

// 📡 API obyekt — renderer uchun barcha funksiyalar
const api = {
  // SOCKET funktsiyalari
  socket: {
    on: (...args) => socket.on(...args),
    once: (...args) => socket.once(...args),
    off: (...args) => socket.off(...args),
    emit: (...args) => socket.emit(...args),
    connected: () => socket.connected,
    id: () => socket.id
  },
  // Game run
  runGame,
  // MAC
  getMac: getMacAddress,
  // IPC invoke (main bilan asinxron bog‘lanish)
  invoke: (...args) => ipcRenderer.invoke(...args)
}

// 🔐 Context isolation tekshiruvi va expose qilish
try {
  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } else {
    // ESKI Electron uchun fallback
    window.electron = electronAPI
    window.api = api
  }
} catch (err) {
  console.error('❌ Preload expose error:', err)
}

