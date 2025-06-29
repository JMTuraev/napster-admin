// src/preload/index.js

import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { exec } from 'child_process'
import { io } from 'socket.io-client'
import { networkInterfaces } from 'os'

// 📡 Socket ulanish (port 3000)
const socket = io('http://127.0.0.1:3000')

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

// 🧠 MAC manzilni olish funksiyasi
function getMacAddress() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
        return net.mac
      }
    }
  }
  return '00:00:00:00:00:00'
}

// 🧠 API obyekt (renderer uchun)
const api = {
  socket: {
    on: (...args) => socket.on(...args),
    off: (...args) => socket.off(...args),
    emit: (...args) => socket.emit(...args),
    connected: () => socket.connected,
    id: () => socket.id
  },
  runGame,
  getMac: () => getMacAddress()
}

// 🔐 Renderer’ga API’larni ulash
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
