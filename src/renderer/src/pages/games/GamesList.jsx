import React, { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GameCard from './GameCard'

const defaultIcon = '/icons/default-icon.png'

function SortableGame({ game, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: game.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1
  }

  return (
    <GameCard
      game={game}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      style={style}
      isDragging={isDragging}
      defaultIcon={defaultIcon}
      {...props}
    />
  )
}

export default function GamesList({
  games = [],
  tabs = [],
  activeTabId,
  onRunGame,
  onEditGame,
  onDeleteGame,
  onChangeGameTab,
  onFetchGames,
  onOrderChange
}) {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, game: null })
  const menuRef = useRef(null)

  // Drag & Drop sensor
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  // Context menu
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

  // Drag drop
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = games.findIndex(g => g.id === active.id)
    const newIndex = games.findIndex(g => g.id === over.id)
    const newGames = arrayMove(games, oldIndex, newIndex)
    if (onOrderChange) onOrderChange(newGames)
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
      onFetchGames && onFetchGames(contextMenu.game.id)
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
      // TO‘G‘RI: path dan foydalanamiz
      if (window.api && window.api.deleteGameIcon && contextMenu.game.path) {
        window.api.deleteGameIcon(contextMenu.game.path)
      }
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

  const gameIds = games.map(g => g.id)

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={gameIds} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', minHeight: 100 }}>
            {games.map((game) => (
              <SortableGame
                key={game.id}
                game={game}
                onDoubleClick={() => onRunGame(game)}
                onContextMenu={e => handleRightClick(e, game)}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 22px #191e3a80'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 12px #1a1a1a40'}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Context menu */}
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
