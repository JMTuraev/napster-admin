import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'

export default function Games() {
  const [games, setGames] = useState([])

  // 🔄 Boshlanishida barcha o‘yinlarni olish
  useEffect(() => {
    window.api.socket.emit('get-games')

    const handleGamesList = async (data) => {
      // 🔍 Har bir game uchun fayl mavjudligini tekshiramiz
      const results = await Promise.all(
        data.map(async (game) => {
          const exists = await window.electron.ipcRenderer.invoke('check-path-exists', game.path)
          return exists ? game : null
        })
      )

      // ❗️ Null bo‘lganlarni chiqarib tashlaymiz
      const filtered = results.filter(Boolean)
      setGames(filtered)
    }

    window.api.socket.on('games', handleGamesList)

    return () => {
      window.api.socket.off('games', handleGamesList)
    }
  }, [])

  // 🟢 Yangi qo‘shilgan o‘yinni local holatda yangilash
  const handleGameAdded = () => {
    window.api.socket.emit('get-games')
  }

  // 🚀 O‘yinni ishga tushirish
  const handleRunGame = (path) => {
    if (!path) return alert('❗️ Fayl yo‘li topilmadi')

    window.electron.ipcRenderer
      .invoke('run-game', path)
      .then(() => console.log('🎮 O‘yin ishga tushdi:', path))
      .catch((err) => alert('❌ Xatolik: ' + err.message))
  }

  return (
    <div className="p-4">
      {/* 🔼 O‘yin qo‘shish formasi */}
      <AddGames onGameAdded={handleGameAdded} />

      {/* 📋 O‘yinlar ro‘yxati */}
      <table className="w-full table-auto border-collapse border border-gray-300 mt-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nomi</th>
            <th className="border p-2">EXE</th>
            <th className="border p-2">Path</th>
            <th className="border p-2">Amal</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">Hech qanday o‘yin topilmadi</td>
            </tr>
          ) : (
            games.map((game) => (
              <tr key={game.id}>
                <td className="border p-2">{game.id}</td>
                <td className="border p-2">{game.name}</td>
                <td className="border p-2">{game.exe}</td>
                <td className="border p-2 text-sm">{game.path}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleRunGame(game.path)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Ishga tushur
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
