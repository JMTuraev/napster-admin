import React, { useEffect, useState, useCallback } from 'react'
import AddGames from './AddGames.jsx'
import GamesList from './GamesList.jsx'
import TabsList from './TabsList.jsx'

export default function Games() {
  const [games, setGames] = useState([])
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(1)

  // O‘yinlar va tabs-ni serverdan olish (useCallback - referensial stability uchun)
  const fetchGames = useCallback((tabId = 1) => {
    window.api?.socket?.emit('get-games', tabId)
  }, [])
  const fetchTabs = useCallback(() => {
    window.api?.socket?.emit('get-tabs')
  }, [])

  // O‘yin va tablarni real-time olish va listenerlarni boshqarish
  useEffect(() => {
    fetchTabs()
    fetchGames(activeTabId)

    // Event handlerlar
    const handleGames = games => setGames(games)
    const handleTabs = tabs => {
      setTabs(tabs)
      if (!tabs.some(tab => tab.id === activeTabId)) {
        setActiveTabId(1)
        fetchGames(1)
      }
    }

    window.api?.socket?.on('games', handleGames)
    window.api?.socket?.on('tabs', handleTabs)
    window.api?.socket?.on('new-game', () => fetchGames(activeTabId))
    window.api?.socket?.on('game-deleted', () => fetchGames(activeTabId))

    return () => {
      window.api?.socket?.off('games', handleGames)
      window.api?.socket?.off('tabs', handleTabs)
      window.api?.socket?.off('new-game')
      window.api?.socket?.off('game-deleted')
    }
    // eslint-disable-next-line
  }, [activeTabId, fetchGames, fetchTabs])

  // Tabni o‘zgartirish
  const handleTabChange = tabId => {
    setActiveTabId(tabId)
    fetchGames(tabId)
  }

  // Tab nomini tahrirlash
  const handleEditTab = (tabId, newName) => {
    window.api?.socket?.emit('edit-tab', { id: tabId, name: newName })
    fetchTabs()
  }

  // O‘yin ishga tushirish (ipcRenderer invoke ishlatilsa)
  const handleRunGame = game => {
    if (!game.path && !game.exePath) return alert('❗️ Fayl yo‘li topilmadi')
    const exePath = game.path || game.exePath
    window.electron?.ipcRenderer
      .invoke('run-game', exePath)
      .then(() => console.log('🎮 O‘yin ishga tushdi:', exePath))
      .catch(err => alert('❌ Xatolik: ' + err.message))
  }

  // O‘yin o‘chirish
  const handleDeleteGame = game => {
    const confirmed = window.confirm(`"${game.exe}" o‘yinini o‘chirmoqchimisiz?`)
    if (confirmed) window.api?.socket?.emit('delete-game', game.id)
  }

  // O‘yin tahrirlash (demo)
  const handleEditGame = game => {
    alert(`Tahrirlash oynasi ochiladi (demo): ${game.exe}`)
  }

  // DRAG&DROP: yangi tartibni UI va serverga jo‘natish
  const handleOrderChange = newGames => {
    setGames(newGames) // UI-da darhol o‘zgaradi
    const order = newGames.map((g, idx) => ({ id: g.id, order: idx }))
    window.api?.socket?.emit('update-game-order', {
      tabId: activeTabId,
      order
    })
  }

  // Game tab o‘zgarganda
  const handleChangeGameTab = (gameId, newTabId) => {
    window.api?.socket?.emit('change-game-tab', { gameId, newTabId })
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
          tabs={tabs}
          activeTabId={activeTabId}
          onRunGame={handleRunGame}
          onEditGame={handleEditGame}
          onDeleteGame={handleDeleteGame}
          onChangeGameTab={handleChangeGameTab}
          onOrderChange={handleOrderChange}
          onFetchGames={() => fetchGames(activeTabId)}
        />
      </div>
    </div>
  )
}
