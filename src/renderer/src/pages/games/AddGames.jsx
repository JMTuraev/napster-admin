import React, { useEffect, useState } from 'react'

export default function AddGames({ onGameAdded }) {
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [fallbackTimer, setFallbackTimer] = useState(null)

  useEffect(() => {
    const handleResult = (res) => {
      clearTimeout(fallbackTimer) // ⛔ Fallbackni to‘xtatamiz
      setLoading(false)

      if (res.status === 'exists') {
        alert('⚠️ Bu path allaqachon mavjud:\n' + res.path)
      } else if (res.status === 'error') {
        alert('❌ Xatolik:\n' + res.message)
      } else if (res.status === 'added') {
        alert('✅ O‘yin muvaffaqiyatli qo‘shildi:\n' + res.game.name)
        setPath('')
        onGameAdded?.()
      }
    }

    window.api.socket.on('game-add-result', handleResult)

    return () => {
      window.api.socket.off('game-add-result', handleResult)
    }
  }, [fallbackTimer, onGameAdded])

  const handleAddGame = () => {
    const trimmedPath = path.trim()
    if (!trimmedPath) return alert('❗️ Path kiritilmadi')

    setLoading(true)
    window.api.socket.emit('add-game', { path: trimmedPath })

    // ⏳ 5 sekund kutamiz, agar server javob bermasa loadingni to‘xtatamiz
    const timer = setTimeout(() => {
      setLoading(false)
    }, 5000)
    setFallbackTimer(timer)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">🎮 O‘yinlar boshqaruvi</h1>

      <div className="flex gap-2 my-4">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="px-2 py-1 border rounded w-1/2"
          placeholder="C:\\Games\\GTA\\gta_sa.exe"
        />
        <button
          onClick={handleAddGame}
          disabled={loading}
          className="px-4 py-1 bg-white text-black rounded"
        >
          {loading ? '⏳ Qo‘shilmoqda...' : 'O‘yin qo‘shish'}
        </button>
      </div>

      {loading && (
        <div className="text-lg text-gray-400">
          ⏳ <span className="animate-pulse">Tekshirilmoqda...</span>
        </div>
      )}
    </div>
  )
}
