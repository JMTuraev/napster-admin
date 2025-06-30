import React, { useEffect, useState } from 'react'

export default function Computers() {
  const [users, setUsers] = useState([])
  const [levels, setLevels] = useState([])

  // 🔄 Foydalanuvchilarni olish
  const fetchUsers = () => {
    window.electron.ipcRenderer.invoke('get-users').then(setUsers)
  }

  // 🔄 Faol level (statuslar) ni olish
  const fetchLevels = () => {
    window.electron.ipcRenderer.invoke('get-levels').then((data) => {
      if (Array.isArray(data)) {
        setLevels(data)
      } else {
        setLevels([])
      }
    })
  }

  useEffect(() => {
    const mac = window.api.getMac()
    const newUser = { mac }

    window.api.socket.emit('new-user', newUser)

    const handleNewUser = (user) => {
      window.electron.ipcRenderer.invoke('add-user', user).then(fetchUsers)
    }

    window.api.socket.on('new-user', handleNewUser)

    fetchUsers()
    fetchLevels()

    return () => {
      window.api.socket.off('new-user', handleNewUser)
    }
  }, [])

  const handleNumberChange = (mac, newNumber) => {
    window.electron.ipcRenderer
      .invoke('update-user-number', { mac, newNumber })
      .then(fetchUsers)
  }

  const handleLevelChange = (mac, levelId) => {
    window.electron.ipcRenderer
      .invoke('update-user-level', { mac, levelId }) // ✅ levelId nomi muhim
      .then(fetchUsers)
  }

  const maxCount = users.length
  const usedNumbers = users
    .map((u) => (u.number !== null && u.number !== undefined ? parseInt(u.number) : null))
    .filter(Boolean)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kompyuterlar ro‘yxati</h1>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">MAC</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Raqami</th>
            <th className="border p-2">Holati</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-red-500 p-2 text-center">
                🔴 Hozircha hech qanday user yo‘q
              </td>
            </tr>
          ) : (
            users.map((user, idx) => {
              const currentNumber = user.number ? parseInt(user.number) : ''
              const currentLevel = user.level_id || ''

              const availableNumbers = []
              for (let i = 1; i <= maxCount; i++) {
                if (!usedNumbers.includes(i) || i === currentNumber) {
                  availableNumbers.push(i)
                }
              }

              return (
                <tr key={user.mac}>
                  <td className="border p-2 text-center">{idx + 1}</td>
                  <td className="border p-2">{user.mac}</td>

                  {/* 🔘 STATUS SELECT */}
                  <td className="border p-2 text-center">
                    <select
                      className="border px-2 py-1 rounded"
                      value={currentLevel}
                      onChange={(e) =>
                        handleLevelChange(user.mac, Number(e.target.value))
                      }
                    >
                      <option value="">Tanlang...</option>
                      {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 🔢 RAQAM SELECT */}
                  <td className="border p-2 text-center">
                    <select
                      className="border px-2 py-1 rounded"
                      value={currentNumber}
                      onChange={(e) =>
                        handleNumberChange(user.mac, parseInt(e.target.value))
                      }
                    >
                      <option value="">Tanlang...</option>
                      {availableNumbers.map((n) => (
                        <option key={n} value={n}>
                          {n}-raqam
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 🟢 HOLATI */}
                  <td className="border p-2 text-center">{user.status}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
