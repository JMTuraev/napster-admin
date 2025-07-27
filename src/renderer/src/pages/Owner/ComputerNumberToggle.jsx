import { useState, useEffect } from 'react'

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
  const [sizeIndex, setSizeIndex] = useState(2) // default = md

  // 🔄 1. Sozlamalarni bazadan olish
  useEffect(() => {
    window.api.invoke('get-pc-number-ui-settings').then((data) => {
      if (data) {
        setEnabled(!!data.show_number)

        const foundIndex = Object.values(SIZE_MAP).indexOf(data.font_size)
        setSizeIndex(foundIndex !== -1 ? foundIndex : 2)
      }
    })
  }, [])

  // 💾 2. Har o‘zgarishda IPC orqali yangilash
  useEffect(() => {
    const payload = {
      show_number: enabled,
      font_size: SIZE_MAP[SIZE_VALUES[sizeIndex]]
    }

    window.api.invoke('update-pc-number-ui-settings', payload)
  }, [enabled, sizeIndex])

  return (
    <div style={{
      maxWidth: 210,
      minHeight: 220,
      margin: '54px 0 0 0',
      background: 'rgba(20,24,44,0.97)',
      borderRadius: 16,
      padding: '22px 18px',
      boxShadow: '0 8px 28px #181b30cc',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
      fontFamily: 'inherit'
    }}>
      <div style={{
        fontWeight: 500,
        fontSize: 17,
        marginBottom: 12,
        color: '#fff',
        letterSpacing: '0.01em',
        textAlign: 'left'
      }}>
        Комната клиента
      </div>

      {/* 🔘 Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ color: '#c4ceef', fontSize: 15 }}>Показывать номер ПК</span>
        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <div style={{
            width: 42,
            height: 22,
            background: enabled ? '#4bb0fa' : '#555',
            borderRadius: 12,
            transition: 'background-color 0.2s'
          }} />
          <div style={{
            position: 'absolute',
            left: enabled ? 22 : 2,
            top: 2,
            width: 18,
            height: 18,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s'
          }} />
        </label>
      </div>

      {/* 📏 Slider */}
      <label style={{
        color: '#c4ceef',
        fontWeight: 500,
        fontSize: 15,
        marginBottom: 6
      }}>
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
          outline: 'none',
          marginBottom: 10,
          cursor: 'pointer',
        }}
      />

      <div style={{
        textAlign: 'center',
        fontSize: 13,
        color: '#8cfca6',
        fontWeight: 500,
        letterSpacing: '0.4px'
      }}>
        {SIZE_LABELS[sizeIndex]} — {SIZE_VALUES[sizeIndex].toUpperCase()}
      </div>
    </div>
  )
}
