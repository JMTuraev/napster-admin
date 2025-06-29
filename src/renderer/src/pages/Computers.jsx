import React, { useEffect, useState } from 'react'

export default function Computers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // MAC manzilini olish (preload orqali)
    const mac = window.api.getMac()
    console.log('💻 Real MAC:', mac)

    const newUser = { mac }

    // Kompyuter serverga signal yuboradi
    window.api.socket.emit('new-user', newUser)

    // Serverdan signal kelganda: bazaga yozish va UI yangilash
    const handleNewUser = (user) => {
      console.log('🟡 Socket orqali yangi user:', user)

      window.electron.ipcRenderer.invoke('add-user', user).then((res) => {
        console.log('✅ DB yozildi:', res)

        // Barcha foydalanuvchilarni qayta olish
        window.electron.ipcRenderer.invoke('get-users').then(setUsers)
      })
    }

    window.api.socket.on('new-user', handleNewUser)

    // Komponent unmounted bo‘lsa, listener tozalanadi
    return () => {
      window.api.socket.off('new-user', handleNewUser)
    }
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kompyuterlar ro‘yxati</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">MAC</th>
            <th className="border p-2">Raqami</th>
            <th className="border p-2">Holati</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-red-500 p-2 text-center">
                🔴 Hozircha hech qanday user yo‘q
              </td>
            </tr>
          ) : (
            users.map((user, idx) => (
              <tr key={user.mac}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{user.mac}</td>
                <td className="border p-2">{user.number || '–'}</td>
                <td className="border p-2">{user.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
