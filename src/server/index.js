// src/server/index.js

const express = require('express')
const path = require('path')
const fs = require('fs')

// 1. BU YERGA STATIC IP-MANZILNI QO‘LINGIZ BILAN YOZING:
const ADMIN_STATIC_IP = '172.20.10.2' // <--- O'ZINGIZNING ADMIN KOMPYUTER STATIC IP MANZILI

const app = express()
const PORT = 3333 // admin-server porti

// Public icons papkasini static qilib ochamiz
const iconsDir = path.join(__dirname, '..', 'renderer', 'public', 'icons')
app.use('/icons', express.static(iconsDir))

// Test endpoint
app.get('/', (req, res) => {
  res.send('Napster Admin API ishlayapti')
})

// Barcha iconlarni ro‘yxatga qaytaradi
app.get('/icons/list', (req, res) => {
  fs.readdir(iconsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Iconlarni o‘qib bo‘lmadi' })

    // Faqat .ico va .png fayllar
    const icons = files
      .filter(file => file.endsWith('.ico') || file.endsWith('.png'))
      .map(file => `/icons/${file}`)

    res.json({ icons })
  })
})

// Faqat static IP ni log qilamiz (tarmoqdan ulanish uchun)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Napster Admin API:   http://${ADMIN_STATIC_IP}:${PORT}`)
  console.log(`Icons static:        http://${ADMIN_STATIC_IP}:${PORT}/icons`)
  console.log(`Icons list:          http://${ADMIN_STATIC_IP}:${PORT}/icons/list`)
})
