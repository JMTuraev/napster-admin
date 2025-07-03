import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'
import GamesList from './GamesList.jsx'
import TabsList from './TabsList.jsx'

export default function Games() {
  const [games, setGames] = useState([])
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(1)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, game: null })

  const fetchTabs = () => window.api.socket.emit('get-tabs')
  const fetchGames = () => window.api.socket.emit('get-games', activeTabId)

  useEffect(() => {
    fetchTabs()
    fetchGames()

    window.api.socket.on('tabs', (data) => {
      setTabs(data)
    })

    window.api.socket.on('games', (data) => {
      setGames(data)
    })

    // If tabs change, check activeTabId still valid
    window.api.socket.on('tabs-updated', (data) => {
      setTabs(data)
      if (!data.find(tab => tab.id === activeTabId)) {
        setActiveTabId(1)
      }
      fetchGames()
    })

    window.api.socket.on('new-game', fetchGames)
    window.api.socket.on('game-deleted', fetchGames)

    return () => {
      window.api.socket.off('tabs')
      window.api.socket.off('games')
      window.api.socket.off('tabs-updated')
      window.api.socket.off('new-game')
      window.api.socket.off('game-deleted')
    }
  }, [activeTabId])

  const handleRunGame = (game) => {
    if (!game.path) return alert('❗️ Fayl yo‘li topilmadi')
    window.electron.ipcRenderer.invoke('run-game', game.path)
      .then(() => console.log('🎮 O‘yin ishga tushdi:', game.path))
      .catch((err) => alert('❌ Xatolik: ' + err.message))
  }

  const handleRightClick = (e, game) => {
    e.preventDefault()
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, game })
    document.addEventListener('click', () => setContextMenu({ show: false, x: 0, y: 0, game: null }), { once: true })
  }

  const handleDeleteGame = (game) => {
    setContextMenu({ show: false, x: 0, y: 0, game: null })
    const confirmed = window.confirm(`"${game.exe}" o‘yinini o‘chirmoqchimisiz?`)
    if (confirmed) window.api.socket.emit('delete-game', game.id)
  }

  const handleEditGame = (game) => {
    setContextMenu({ show: false, x: 0, y: 0, game: null })
    alert(`Tahrirlash oynasi ochiladi (demo): ${game.exe}`)
  }

  // Tabs bilan ishlash uchun funksiyalar
  const handleTabChange = (id) => {
    setActiveTabId(id)
  }

  const handleAddTab = () => {
    window.api.socket.emit('add-tab')
  }

  const handleEditTab = (id, name) => {
    window.api.socket.emit('edit-tab', { id, name })
  }

  const handleDeleteTab = (id) => {
    window.api.socket.emit('delete-tab', id)
  }

  // Faqat hozirgi tabdagi o‘yinlar
  const filteredGames = games.filter(game => game.tabId === activeTabId)

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <TabsList
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        onAddTab={handleAddTab}
        onEditTab={handleEditTab}
        onDeleteTab={handleDeleteTab}
      />

      <AddGames onGameAdded={() => window.api.socket.emit('get-games', activeTabId)} />

      <div
        style={{
          marginTop: 40,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 34,
        }}
      >
        <GamesList
          games={filteredGames}
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
