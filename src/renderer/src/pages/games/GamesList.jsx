import React from 'react'

const defaultIcon = '/icons/default-icon.png'

export default function GamesList({
  games = [],
  contextMenu,
  onRunGame,
  onRightClick,
  onEditGame,
  onDeleteGame,
}) {
  const onIconError = (e) => {
    e.target.src = defaultIcon
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
        </div>
      ))}
    </>
  )
}
