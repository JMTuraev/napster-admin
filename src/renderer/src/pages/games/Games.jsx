import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'
import ListGames from './ListGames.jsx'

export default function Games() {
  const [games, setGames] = useState([])
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, game: null })

  // O‘yinlarni olish
  const fetchGames = () => window.api.socket.emit('get-games')

  useEffect(() => {
    fetchGames()
    window.api.socket.on('games', setGames)
    window.api.socket.on('new-game', fetchGames)
    window.api.socket.on('game-deleted', fetchGames)
    return () => {
      window.api.socket.off('games', setGames)
      window.api.socket.off('new-game', fetchGames)
      window.api.socket.off('game-deleted', fetchGames)
    }
  }, [])

  // Double click — run
  const handleRunGame = (game) => {
    if (!game.path) return alert('❗️ Fayl yo‘li topilmadi')
    window.electron.ipcRenderer
      .invoke('run-game', game.path)
      .then(() => console.log('🎮 O‘yin ishga tushdi:', game.path))
      .catch((err) => alert('❌ Xatolik: ' + err.message))
  }

  // O‘ng tugma (right click) — context menyu
  const handleRightClick = (e, game) => {
    e.preventDefault()
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, game })
    document.addEventListener('click', hideContextMenu, { once: true })
  }
  const hideContextMenu = () => setContextMenu({ show: false, x: 0, y: 0, game: null })

  // O‘chirish va tahrirlash
  const handleDeleteGame = (game) => {
    hideContextMenu()
    const confirmed = window.confirm(`"${game.exe}" o‘yinini o‘chirmoqchimisiz?`)
    if (confirmed) window.api.socket.emit('delete-game', game.id)
  }
  const handleEditGame = (game) => {
    hideContextMenu()
    alert(`Tahrirlash oynasi ochiladi (demo): ${game.exe}`)
  }

  // Faqat .exe va path borlar
  const validGames = Array.isArray(games)
    ? games.filter(
        (g) =>
          g.path &&
          typeof g.path === 'string' &&
          g.path.toLowerCase().includes('.exe')
      )
    : []

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <AddGames onGameAdded={fetchGames} />
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 34,
        }}
      >
        <ListGames
          games={validGames}
          contextMenu={contextMenu}
          onRunGame={handleRunGame}
          onRightClick={handleRightClick}
          onEditGame={handleEditGame}
          onDeleteGame={handleDeleteGame}
        />
      </div>
    </div>
  )
}
