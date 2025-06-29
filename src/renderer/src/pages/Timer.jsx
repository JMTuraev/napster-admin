import { useEffect, useState } from 'react'

export default function Timer() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!window.api?.socket) {
      console.error('❌ window.api.socket is undefined — preload expose ishlamayapti')
      return
    }

    // So‘rov yuborish
    window.api.socket.emit('get-users')

    // Javob olish
    window.api.socket.on('users', (data) => {
      setUsers(data)
    })

    // Tozalash
    return () => {
      window.api.socket.off('users')
    }
  }, [])

  return (
    <div>
      <h1>Время</h1>
      <p>Список всех компьютеров:</p>
      <ul>
        {users.map((user, i) => (
          <li key={user.id || i}>
            {user.name || user.id} — 🟢 Онлайн
          </li>
        ))}
      </ul>
    </div>
  )
}
