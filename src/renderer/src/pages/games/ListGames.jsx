import React from 'react'

const defaultIcon = '/icons/default.png'

export default function ListGames({
  games = [],
  contextMenu,
  onRunGame,
  onRightClick,
  onEditGame,
  onDeleteGame,
}) {
  // ICON error uchun fallback
  const onIconError = (e) => {
    e.target.src = defaultIcon
  }

  if (!games.length) {
    return (
      <div style={{
        color: '#b0b9d5', background: 'rgba(25,28,43,0.9)', padding: 32,
        borderRadius: 24, fontSize: 20, textAlign: 'center', width: '100%'
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
          onContextMenu={e => onRightClick(e, game)}
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
                onClick={() => onEditGame(game)}
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
                onClick={() => onDeleteGame(game)}
              >
                🗑 Удалить
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
