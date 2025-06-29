import React, { useState } from 'react'

function AdminPage() {
  const [status, setStatus] = useState('bloklangan')

  const handleSave = () => {
    window.api.socket.emit('status-update', status)
    alert('✅ Status yuborildi!')
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <label>
        Foydalanuvchi statusi:
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="bloklangan">Bloklangan</option>
          <option value="ruxsat">Ruxsat berilgan</option>
        </select>
      </label>
      <button onClick={handleSave}>Saqlash</button>
    </div>
  )
}

export default AdminPage
