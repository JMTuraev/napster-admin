import React, { useState } from 'react'

export default function AddGames() {
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddGame = () => {
    if (!path.trim()) return
    setLoading(true)

    // ✅ Yuborilayotgan qiymat object holatida bo‘lishi kerak
    window.api.socket.emit('add-game', { path })

    // 🟢 Faqat log uchun, backenddan success bo‘lsa 'new-game' eventi keladi
    window.api.socket.once('new-game', (game) => {
      console.log('✅ O‘yin qo‘shildi:', game)
      setLoading(false)
      setPath('') // 🔄 inputni tozalash
    })

    // ❌ Fallback: agar 5 sekund ichida javob kelmasa loadingni to‘xtatish
    setTimeout(() => setLoading(false), 5000)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">🎮 O‘yinlar boshqaruvi</h1>

      <div className="flex gap-2 my-4">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="px-2 py-1 border rounded w-1/2"
          placeholder="O‘yin EXE yo‘lini kiriting"
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
        <div className="text-lg text-gray-300">
          ⏳ <span className="animate-pulse">Tekshirilmoqda...</span>
        </div>
      )}
    </div>
  )
}
