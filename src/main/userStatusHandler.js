// src/main/userStatusHandler.js
import { getLatestTimerByMac } from '../database/timer.js'

export function handleUserStatusEvents(socket, io) {
  socket.on('get-status', (mac) => {
    const lastTimer = getLatestTimerByMac(mac)
    // Agar timer yo‘q yoki oxirgi status running bo‘lmasa => LOCKED
    const locked = !(lastTimer && lastTimer.status === 'running')
    socket.emit('status', { mac, locked })
    console.log('[SOCKET] STATUS yuborildi:', mac, locked)
  })
}
