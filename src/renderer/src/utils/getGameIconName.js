// src/utils/getGameIconName.js

export function getGameIconName(exePath) {
  if (!exePath) return 'default.png'
  const exeName = exePath.split(/[\\/]/).pop().replace('.exe', '')
  // Simple hash (yoki timestampdan olish uchun o‘zgartiring)
  const hash = Array.from(exePath).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `${exeName}_${hash}.ico`
}

export function getGameIconPath(exePath) {
  return `/icons/${getGameIconName(exePath)}`
}
