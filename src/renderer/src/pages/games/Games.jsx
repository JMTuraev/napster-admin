import React, { useEffect, useState } from 'react'
import AddGames from './AddGames.jsx'

const defaultIcon = '/icons/default-icon.png'

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
        {validGames.length === 0 ? (
          <div style={{
            color: '#b0b9d5', background: 'rgba(25,28,43,0.9)', padding: 32,
            borderRadius: 24, fontSize: 20, textAlign: 'center', width: '100%'
          }}>
            Hech qanday o‘yin topilmadi
          </div>
        ) : (
          validGames.map((game) => (
            <div
              key={game.id}
              style={{
                width: 110,
                height: 120,
                background: 'linear-gradient(120deg, #222345 60%, #2e325c 100%)',
                borderRadius: 22,
                boxShadow: '0 1px 12px #1a1a1a40',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative',
                transition: 'box-shadow .14s, transform .14s',
                marginBottom: 8,
                border: '2px solid transparent'
              }}
              title="2x bos: Ishga tushur • O‘ng tugma: Amal"
              onDoubleClick={() => handleRunGame(game)}
              onContextMenu={e => handleRightClick(e, game)}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 22px #191e3a80'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 12px #1a1a1a40'}
            >
              <img
                src={defaultIcon}
                alt="icon"
                width={48}
                height={48}
                style={{
                  borderRadius: 12,
                  background: '#181b1f',
                  boxShadow: '0 2px 8px #191e3a40',
                  marginBottom: 14
                }}
              />
              <span style={{
                fontSize: 14,
                fontWeight: 200,
                color: '#ff8383',
                letterSpacing: 1,
                textAlign: 'center',
                marginTop: 0,
                wordBreak: 'break-word'
              }}>
                {game.exe}
              </span>

              {/* O‘ng tugma menyu */}
              {contextMenu.show && contextMenu.game?.id === game.id && (
                <div
                  style={{
                    position: 'fixed',
                    top: contextMenu.y + 6,
                    left: contextMenu.x + 10,
                    zIndex: 999,
                    background: '#23243e',
                    color: '#fff',
                    borderRadius: 13,
                    boxShadow: '0 4px 16px #1a194477',
                    padding: '7px 0',
                    minWidth: 112,
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                  }}
                >
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6cb5ff',
                      padding: '10px 19px',
                      fontSize: 16,
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid #2d3159'
                    }}
                    onClick={() => handleEditGame(game)}
                  >
                    ✏️ Изменить
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6565',
                      padding: '10px 19px',
                      fontSize: 16,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDeleteGame(game)}
                  >
                    🗑 Удалить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
