import { useState, useEffect } from 'react'
import socket from '../../socket' // ⚠️ To‘g‘ri path

const SIZE_LABELS = ['XS', 'S', 'M', 'L', 'XL']
const SIZE_VALUES = ['xs', 'sm', 'md', 'lg', 'xl']
const SIZE_MAP = {
  xs: 22,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 60
}

export default function ComputerNumberToggle() {
  const [enabled, setEnabled] = useState(true)
  const [sizeIndex, setSizeIndex] = useState(2)

  useEffect(() => {
    window.api.invoke('get-pc-number-ui-settings').then((data) => {
      if (data) {
        setEnabled(!!data.show_number)
        const idx = Object.values(SIZE_MAP).indexOf(data.font_size)
        setSizeIndex(idx !== -1 ? idx : 2)
      }
    })
  }, [])

  useEffect(() => {
    const payload = {
      show_number: enabled,
      font_size: SIZE_MAP[SIZE_VALUES[sizeIndex]]
    }
    window.api.invoke('update-pc-number-ui-settings', payload)
    socket.emit('send-pc-number-ui-settings')
  }, [enabled, sizeIndex])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'none',
      boxShadow: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ color: '#fff', fontSize: 17, marginBottom: 14, fontWeight: 500 }}>
        Комната клиента
      </div>

      {/* 🔘 Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ color: '#c4ceef', fontSize: 15 }}>Показывать номер ПК</span>
        <label style={{ position: 'relative', cursor: 'pointer', display: 'inline-block', width: 42, height: 22 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
          />
          <div style={{
            width: 42,
            height: 22,
            background: enabled ? '#4bb0fa' : '#555',
            borderRadius: 12,
            transition: 'background 0.2s'
          }} />
          <div style={{
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            width: 18,
            height: 18,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s'
          }} />
        </label>
      </div>

      {/* 📏 Slider */}
      <label style={{ color: '#c4ceef', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
        Размер шрифта:
      </label>
      <input
        type="range"
        min={0}
        max={4}
        value={sizeIndex}
        onChange={(e) => setSizeIndex(Number(e.target.value))}
        style={{
          width: '100%',
          appearance: 'none',
          height: 6,
          borderRadius: 4,
          background: '#2a3251',
          marginBottom: 10,
          cursor: 'pointer'
        }}
      />
      <div style={{
        textAlign: 'center',
        fontSize: 13,
        color: '#8cfca6',
        fontWeight: 500
      }}>
        {SIZE_LABELS[sizeIndex]} — {SIZE_VALUES[sizeIndex].toUpperCase()}
      </div>
    </div>
  )
}
