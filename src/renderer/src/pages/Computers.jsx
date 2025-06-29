import React, { useEffect, useState } from 'react'

export default function Computers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Dastlabki barcha userlarni olish
    window.electron.ipcRenderer.invoke('get-users').then(setUsers)

    // Mac orqali kelgan yangi userni qabul qilish
    window.api.socket.on('new-user', (user) => {
      window.electron.ipcRenderer.invoke('add-user', user).then((res) => {
        console.log('✅ DB yozildi:', res)
        // Qayta userlar ro‘yxatini yangilash
        window.electron.ipcRenderer.invoke('get-users').then(setUsers)
      })
    })

    return () => {
      window.api.socket.off('new-user')
    }
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kompyuterlar ro‘yxati</h1>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">MAC</th>
            <th className="border p-2">Nomi</th>
            <th className="border p-2">Holati</th>
            <th className="border p-2">Qo‘shilgan sana</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.mac}>
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{user.mac}</td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-white text-xs ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="border p-2">{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
