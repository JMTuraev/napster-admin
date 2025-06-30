import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'

export default function Games() {
  const [games, setGames] = useState([])

  // 🔁 Barcha o‘yinlarni olish funksiyasi
  const fetchGames = () => {
    window.api.socket.emit('get-games')
  }

  useEffect(() => {
    fetchGames()

    // 🔄 socketdan ma’lumot olish
    window.api.socket.on('games', setGames)
    window.api.socket.on('new-game', fetchGames)
    window.api.socket.on('game-deleted', fetchGames)

    return () => {
      window.api.socket.off('games', setGames)
      window.api.socket.off('new-game', fetchGames)
      window.api.socket.off('game-deleted', fetchGames)
    }
  }, [])

  // 🚀 O‘yinni ishga tushirish
  const handleRunGame = (path) => {
    if (!path) return alert('❗️ Fayl yo‘li topilmadi')

    window.electron.ipcRenderer
      .invoke('run-game', path)
      .then(() => console.log('🎮 O‘yin ishga tushdi:', path))
      .catch((err) => alert('❌ Xatolik: ' + err.message))
  }

  // 🗑 O‘yin o‘chirish (prompt emas, confirm ishlatiladi)
  const handleDeleteGame = (game) => {
    const confirmed = confirm(`"${game.name}" o‘yinini o‘chirmoqchimisiz?`)
    if (confirmed) {
      window.api.socket.emit('delete-game', game.id)
    }
  }

  // 🧹 Faqat to‘g‘ri pathlarga ega bo‘lgan o‘yinlar
  const validGames = games.filter(
    (g) =>
      g.path &&
      typeof g.path === 'string' &&
      g.path.includes('\\') &&
      g.path.toLowerCase().includes('.exe')
  )

  return (
    <div className="p-4">
     {/* 🔼 Qo‘shish formasi */}
      <AddGames onGameAdded={fetchGames} />

      {/* 📋 Jadval */}
      <table className="w-full table-auto border-collapse border border-gray-300 mt-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nomi</th>
            <th className="border p-2">EXE</th>
            <th className="border p-2">Path</th>
            <th className="border p-2">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {validGames.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                Hech qanday o‘yin topilmadi
              </td>
            </tr>
          ) : (
            validGames.map((game) => (
              <tr key={game.id}>
                <td className="border p-2">{game.id}</td>
                <td className="border p-2">{game.name}</td>
                <td className="border p-2">{game.exe}</td>
                <td className="border p-2 text-sm">{game.path}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleRunGame(game.path)}
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Ishga tushur
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    O‘chirish
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
