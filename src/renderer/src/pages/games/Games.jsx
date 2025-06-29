import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'

export default function Games() {
  const [games, setGames] = useState([])

  // 🔄 Boshlanishida barcha o‘yinlarni olish
  useEffect(() => {
    window.api.socket.emit('get-games')

    const handleGamesList = (data) => {
      setGames(data)
    }

    window.api.socket.on('games', handleGamesList)

    return () => {
      window.api.socket.off('games', handleGamesList)
    }
  }, [])

  // 🟢 Yangi qo‘shilgan o‘yinni local holatda yangilash
  const handleGameAdded = () => {
    window.api.socket.emit('get-games') // qayta ro‘yxat olish
  }
console.log(games);
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
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">Hech qanday o‘yin topilmadi</td>
            </tr>
          ) : (
            games.map((game) => (
              <tr key={game.id}>
                <td className="border p-2">{game.id}</td>
                <td className="border p-2">{game.name}</td>
                <td className="border p-2">{game.exe}</td>
                <td className="border p-2 text-sm">{game.path}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
