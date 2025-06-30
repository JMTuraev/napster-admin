import React, { useEffect, useState } from 'react'
import LevelPrice from './LevelPrice'

const HOURLY_PRICE = 6000 // so‘m
const getTimeLeft = (start, duration) => {
  const now = Date.now()
  const end = new Date(start).getTime() + duration * 1000
  const diff = Math.max(end - now, 0)
  const seconds = Math.floor(diff / 1000)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export default function Timer() {
  const [users, setUsers] = useState([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    window.api.socket.emit('get-users')
    window.api.socket.on('users', (data) => {
      setUsers(data)
    })

    // 1 sekundda bir qayta chizish uchun trigger
    const interval = setInterval(() => setTick(t => t + 1), 1000)

    return () => {
      window.api.socket.off('users')
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🕒 Timer Paneli</h1>
      
          <div className="p-4">
      <h1 className="text-xl font-bold mb-4">⏱ Timer</h1>

      {/* Narxlar komponenti */}
      <LevelPrice />
    </div>

      <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Raqam</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Holati</th>
            <th className="border p-2">Timer</th>
            <th className="border p-2">Narx</th>
            <th className="border p-2">Boshqaruv</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-red-500 p-4">
                🔴 Kompyuterlar yo‘q
              </td>
            </tr>
          ) : (
            users
              .filter(u => u.number) // faqat raqamlanganlar
              .sort((a, b) => a.number - b.number)
              .map((user, idx) => {
                const hasTimer = user.session_start && user.session_time
                const timeLeft = hasTimer
                  ? getTimeLeft(user.session_start, user.session_time)
                  : '—'

                const soatNarxi = HOURLY_PRICE // kelajakda statusga qarab o‘zgaradi

                const pul = hasTimer
                  ? Math.round((soatNarxi / 3600) * user.session_time)
                  : 0

                return (
                  <tr key={user.mac}>
                    <td className="border p-2 text-center">{idx + 1}</td>
                    <td className="border p-2 text-center">{user.number}</td>
                    <td className="border p-2 text-center capitalize">{user.user_status || 'oddiy'}</td>
                    <td className="border p-2 text-center">
                      <span className={`px-2 py-1 rounded text-white text-sm ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="border p-2 text-center font-mono text-lg">
                      {hasTimer ? timeLeft : '—'}
                    </td>
                    <td className="border p-2 text-center">{pul.toLocaleString()} so‘m</td>
                    <td className="border p-2 text-center">
                      {hasTimer ? (
                        <button className="px-3 py-1 bg-red-600 text-white rounded">Stop</button>
                      ) : (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded">Start</button>
                      )}
                    </td>
                  </tr>
                )
              })
          )}
        </tbody>
      </table>
    </div>
  )
}
