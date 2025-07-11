const path = require('path')
const fs = require('fs')
const extractIcon = require('extract-file-icon')
const crypto = require('crypto')

// PUBLIC papkaga icon saqlash
const iconDir = path.join(__dirname, '..', '..', 'renderer', 'public', 'icons')
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true })

function getIconFileName(exePath) {
  const exe = path.basename(exePath, '.exe')
  const hash = crypto.createHash('md5').update(exePath).digest('hex')
  return `${exe}_${hash}.ico`
}

function getGameIcon(exePath) {
  if (!exePath) return path.join(iconDir, 'default.png')
  const iconFile = path.join(iconDir, getIconFileName(exePath))
  if (fs.existsSync(iconFile)) return iconFile
  try {
    const buf = extractIcon(exePath, 256) || extractIcon(exePath, 48) || extractIcon(exePath, 32)
    if (buf && buf.length) {
      fs.writeFileSync(iconFile, buf)
      return iconFile
    }
  } catch (err) {
    // fallback
    return path.join(iconDir, 'default.png')
  }
  return path.join(iconDir, 'default.png')
}

function deleteGameIcon(exePath) {
  const iconFile = path.join(iconDir, getIconFileName(exePath))
  if (fs.existsSync(iconFile)) fs.unlinkSync(iconFile)
}

module.exports = { getGameIcon, deleteGameIcon }
