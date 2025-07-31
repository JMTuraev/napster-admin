// src/utils/macValidator.js

/**
 * MAC manzil formatini tekshiradi: 6 juft hex raqamlar
 */
export function isValidMacFormat(mac) {
  return /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(mac)
}

/**
 * Ma’lum virtual adapter MAC larini bloklaydi (masalan VMware, Hyper-V)
 */
export function isVirtualMac(mac) {
  const lower = mac.toLowerCase()
  return lower.startsWith('00:05:69') || lower.startsWith('00:50:56') // VMware, Hyper-V
}

/**
 * Wi-Fi MAC-lar aniqlanishi mumkin bo‘lgan prefixlar
 * (bu ixtiyoriy: MAC prefixlar vendorga bog‘liq, noaniq)
 */
export function isLikelyWifiMac(mac) {
  const wifiPrefixes = [
    'c8:f6:50', // Intel
    '00:25:9c', // Apple
    'd8:96:95', // Realtek
    '00:1a:11',
    'e8:94:f6',
    'f4:f5:e8'
  ]
  return wifiPrefixes.includes(mac.slice(0, 8).toLowerCase())
}
