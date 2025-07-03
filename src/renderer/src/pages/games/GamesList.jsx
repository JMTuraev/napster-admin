import React, { useState, useEffect, useRef } from 'react'

const defaultIcon = '/icons/default-icon.png'

export default function GamesList({
  games = [],
  tabs = [],
  activeTabId,
  onRunGame,
  onRightClick,
  onEditGame,
  onDeleteGame,
  onChangeGameTab, // yangi: o‘yinning tabId ni o‘zgartirish uchun
  onFetchGames
}) {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, game: null })
  const menuRef = useRef(null)

  // Kontekst menyuni yopish: tashqariga bosganda
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, game: null })
      }
    }
    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [contextMenu.show])

  const onIconError = (e) => {
    e.target.src = defaultIcon
  }

  const handleRightClick = (e, game) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      game
    })
  }

  const handleChangeTab = (tabId) => {
    if (contextMenu.game && onChangeGameTab) {
      onChangeGameTab(contextMenu.game.id, tabId)
      setContextMenu({ show: false, x: 0, y: 0, game: null })
      onFetchGames(contextMenu.game.id)
    }
  }

  const handleEdit = () => {
    if (contextMenu.game) {
      onEditGame(contextMenu.game)
      setContextMenu({ show: false, x: 0, y: 0, game: null })
    }
  }

  const handleDelete = () => {
    if (contextMenu.game) {
      onDeleteGame(contextMenu.game)
      setContextMenu({ show: false, x: 0, y: 0, game: null })
    }
  }

  if (!games.length) {
    return (
      <div style={{
        color: '#b0b9d5',
        background: 'rgba(25,28,43,0.9)',
        padding: 32,
        borderRadius: 24,
        fontSize: 20,
        textAlign: 'center',
        width: '100%'
      }}>
        Hech qanday o‘yin topilmadi
      </div>
    )
  }

  return (
    <>
      {games.map((game) => (
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
          onDoubleClick={() => onRunGame(game)}
          onContextMenu={e => handleRightClick(e, game)}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 22px #191e3a80'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 12px #1a1a1a40'}
        >
          <img
            src={game.icon || defaultIcon}
            alt="icon"
            width={48}
            height={48}
            onError={onIconError}
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
        </div>
      ))}

      {/* KONTEKST MENYU */}
      {contextMenu.show && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#23243e',
            color: '#fff',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            padding: 8,
            zIndex: 1000,
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#6cb5ff',
              padding: '8px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              borderBottom: '1px solid #2d3159'
            }}
            onClick={handleEdit}
          >
            ✏️ Tahrirlash
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6565',
              padding: '8px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={handleDelete}
          >
            🗑 O‘chirish
          </button>

          <div
            style={{
              marginTop: 8,
              borderTop: '1px solid #2d3159',
              paddingTop: 6,
              maxHeight: 150,
              overflowY: 'auto',
            }}
          >
            <div style={{ marginBottom: 6, fontWeight: '600', color: '#6cb5ff' }}>
              Tabs tanlash:
            </div>
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => handleChangeTab(tab.id)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  backgroundColor: contextMenu.game?.tabId === tab.id ? '#4a90e2' : 'transparent',
                  color: contextMenu.game?.tabId === tab.id ? 'white' : '#ccc',
                  borderRadius: 4,
                  userSelect: 'none'
                }}
              >
                {tab.name}
                {contextMenu.game?.tabId === tab.id && ' ✔️'}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
