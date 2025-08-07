// src/main/services/updateServiceForAdmin.js
import path from 'path'
import fs from 'fs'

export function getUpdateDir(type = 'admin') {
  const dir = path.join(process.cwd(), 'updates', type)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}
