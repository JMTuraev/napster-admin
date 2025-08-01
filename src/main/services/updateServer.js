// src/main/updateServer.js

import express from 'express'
import path from 'path'

export function startUpdateServer() {
  const app = express()
  const updatesDir = path.resolve('updates/user') // .exe fayl shu yerda

  // Static fayllar uchun route
  app.use('/updates', express.static(updatesDir))

  const PORT = 3010
  app.listen(PORT, () => {
    console.log(`🟢 Update server ishlayapti: http://192.168.1.10:${PORT}/updates/`)
  })
}
