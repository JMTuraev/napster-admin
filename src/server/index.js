// src/server/index.js

const express = require('express')
const path = require('path')
const fs = require('fs')

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Napster Admin API: http://YOUR_ADMIN_IP:${PORT}`)
})
