import React, { useEffect, useRef, useState } from 'react'

export default function AddGames({ onGameAdded }) {
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const fallbackTimer = useRef(null)

  useEffect(() => {
    // Serverdan javob kelganda
    function handleResult(res) {
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current)
        fallbackTimer.current = null
      }
      setLoading(false)

      if (res.status === 'exists') {
        setStatus('Bu path allaqachon mavjud!')
      } else if (res.status === 'error') {
        setStatus('Xatolik: ' + res.message)
      } else if (res.status === 'added') {
        setStatus('O‘yin muvaffaqiyatli qo‘shildi!')
        setPath('')
        onGameAdded?.()
      }
    }

    window.api?.socket?.on('game-add-result', handleResult)
    return () => {
      window.api?.socket?.off('game-add-result', handleResult)
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current)
        fallbackTimer.current = null
      }
    }
  }, [onGameAdded])

  // O‘yin qo‘shish
  const handleAddGame = () => {
    const trimmedPath = path.trim()
    if (!trimmedPath) {
      setStatus('Path kiritilmadi!')
      return
    }
    setLoading(true)
    setStatus('')

    // Emit qilamiz
    window.api?.socket?.emit('add-game', { path: trimmedPath })

    // Fallback timeout
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
    fallbackTimer.current = setTimeout(() => {
      setLoading(false)
      setStatus('Serverdan javob kelmadi.')
    }, 5000)
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>
        🎮 O‘yinlar boshqaruvi
      </h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          value={path}
          onChange={e => setPath(e.target.value)}
          style={{
            padding: '7px 10px',
            border: '1px solid #ccc',
            borderRadius: 7,
            width: 320,
            fontSize: 16
          }}
          placeholder="C:\Games\GTA\gta_sa.exe"
          disabled={loading}
        />
        <button
          onClick={handleAddGame}
          disabled={loading}
          style={{
            padding: '7px 16px',
            background: loading ? '#d9e0ef' : '#fff',
            color: '#23243e',
            border: 'none',
            borderRadius: 7,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16
          }}
        >
          {loading ? '⏳ Qo‘shilmoqda...' : 'O‘yin qo‘shish'}
        </button>
      </div>

      {loading && (
        <div style={{ fontSize: 17, color: '#8892bf', marginBottom: 7 }}>
          ⏳ <span style={{ opacity: 0.8 }}>Tekshirilmoqda...</span>
        </div>
      )}

      {!!status && (
        <div
          style={{
            fontSize: 16,
            color: status.includes('muvaffaqiyatli') ? '#28c76f' : '#f66',
            marginTop: 8
          }}
        >
          {status}
        </div>
      )}
    </div>
  )
}
