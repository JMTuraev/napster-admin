import React from 'react'
import { getGameIconPath } from '../../utils/getGameIconName'

export default function GameCard({
  game,
  setNodeRef,
  listeners,
  attributes,
  style,
  isDragging,
  onDoubleClick,
  onContextMenu,
  onMouseOver,
  onMouseOut
}) {
  // 1. Ikki variant: agar massivda icon bor — ishlat, bo‘lmasa algoritmdan ol
  const icon = game.icon || (game.path ? getGameIconPath(game.path) : '/icons/default.png')

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        opacity: isDragging ? 0.7 : 1,
        border: isDragging ? '2px solid #4a90e2' : '2px solid transparent',
        borderRadius: 22,
        padding: 14,
        background: 'linear-gradient(120deg, #222345 60%, #2e325c 100%)',
        color: '#fff',
        minWidth: 110,
        height: 120,
        textAlign: 'center',
        boxShadow: isDragging ? '0 0 12px #1a90e8' : '0 1px 12px #1a1a1a40',
        userSelect: 'none',
        cursor: 'grab',
        marginBottom: 8,
        position: 'relative',
        transition: 'box-shadow .14s, border .14s, transform .14s',
      }}
      title="2x bos: Ishga tushur • O‘ng tugma: Amal"
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <img
        src={icon}
        alt="icon"
        width={48}
        height={48}
        onError={e => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/icons/default.png'
        }}
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
  )
}
