// src/main/utils/copyImageFile.js

import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, basename } from 'path'

// destDir = public/icons (rootdan boshlab)
const destDir = join(process.cwd(), 'src', 'renderer', 'public', 'icons')

export function copyImageFile(srcPath) {
  if (!srcPath) return ''
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
  const filename = Date.now() + '-' + basename(srcPath)
  const destPath = join(destDir, filename)
  copyFileSync(srcPath, destPath)
  // Renderer uchun PUBLIC yo‘li:
  return `/icons/${filename}`
}
