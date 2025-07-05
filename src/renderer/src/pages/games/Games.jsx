import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'
import GamesList from './GamesList.jsx'
import TabsList from './TabsList.jsx'

export default function Games() {
  const [games, setGames] = useState([])
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(1)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, game: null })

  // O‘yinlar va tabs-ni serverdan olish
  const fetchGames = (tabId = 1) => {
    window.api.socket.emit('get-games', tabId)
  }

  const fetchTabs = () => {
    window.api.socket.emit('get-tabs')
  }

  useEffect(() => {
    fetchTabs()
    fetchGames(activeTabId)

    window.api.socket.on('games', (games) => setGames(games))
    window.api.socket.on('tabs', (tabs) => {
      setTabs(tabs)
      if (!tabs.some(tab => tab.id === activeTabId)) {
        setActiveTabId(1)
        fetchGames(1)
      }
    })
    window.api.socket.on('new-game', () => fetchGames(activeTabId))
    window.api.socket.on('game-deleted', () => fetchGames(activeTabId))

    return () => {
      window.api.socket.off('games')
      window.api.socket.off('tabs')
      window.api.socket.off('new-game')
      window.api.socket.off('game-deleted')
    }
  }, [activeTabId])

  // Tabni o‘zgartirish
  const handleTabChange = (tabId) => {
    setActiveTabId(tabId)
    fetchGames(tabId)
  }

  // Tab nomini tahrirlash
  const handleEditTab = (tabId, newName) => {
    console.log(tabId, newName)
    // Serverga tahrirlangan nomni yuborish
    window.api.socket.emit('edit-tab', {id:tabId, name:newName })
    // Yangi tabs olish
    fetchTabs()
  }

  // O‘yin ishga tushirish
  const handleRunGame = (game) => {
    if (!game.path) return alert('❗️ Fayl yo‘li topilmadi')
    window.electron.ipcRenderer
      .invoke('run-game', game.path)
      .then(() => console.log('🎮 O‘yin ishga tushdi:', game.path))
      .catch((err) => alert('❌ Xatolik: ' + err.message))
  }

  // Context menyu
  const handleRightClick = (e, game) => {
    e.preventDefault()
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, game })
    document.addEventListener('click', hideContextMenu, { once: true })
  }
  const hideContextMenu = () => setContextMenu({ show: false, x: 0, y: 0, game: null })

  // O‘chirish
  const handleDeleteGame = (game) => {
    hideContextMenu()
    const confirmed = window.confirm(`"${game.exe}" o‘yinini o‘chirmoqchimisiz?`)
    if (confirmed) window.api.socket.emit('delete-game', game.id)
  }

  // Tahrirlash (demo uchun)
  const handleEditGame = (game) => {
    hideContextMenu()
    alert(`Tahrirlash oynasi ochiladi (demo): ${game.exe}`)
  }

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      {/* Tabs ro‘yxati */}
      <TabsList
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        onEditTab={handleEditTab}
      />

      {/* O‘yin qo‘shish formasi */}
      <AddGames onGameAdded={() => fetchGames(activeTabId)} />

      {/* O‘yinlar ro‘yxati */}
      <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 34 }}>
        <GamesList
          games={games}
          onFetchGames={() => fetchGames(activeTabId)}
          contextMenu={contextMenu}
          onRunGame={handleRunGame}
          onRightClick={handleRightClick}
          onEditGame={handleEditGame}
          onDeleteGame={handleDeleteGame}
          tabs={tabs}
          activeTabId={activeTabId}
          onChangeGameTab={(gameId, newTabId) => {
            window.api.socket.emit('change-game-tab', { gameId, newTabId })
          }}
        />
      </div>
    </div>
  )
}
