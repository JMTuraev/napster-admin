import React, { useState } from 'react'

export default function TabsList({ tabs, activeTabId, onTabChange, onAddTab, onEditTab, onDeleteTab }) {
  const [editingTabId, setEditingTabId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // tabs massivini boolean empty bilan normalize qilamiz
  const normalizedTabs = tabs.map(tab => ({
    ...tab,
    empty: Boolean(tab.empty)
  }))

  const handleDoubleClick = (tab) => {
    setEditingTabId(tab.id)
    setEditValue(tab.name)
  }

  const saveEdit = (id) => {
    if (editValue.trim() !== '') {
      onEditTab(id, editValue.trim())
      setEditingTabId(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
      {normalizedTabs.map(tab => (
        <div key={tab.id} style={{ position: 'relative' }}>
          {editingTabId === tab.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEdit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(tab.id)
                if (e.key === 'Escape') setEditingTabId(null)
              }}
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
            />
          ) : (
            <button
              onClick={() => onTabChange(tab.id)}
              onDoubleClick={() => handleDoubleClick(tab)}
              style={{
                padding: '6px 12px',
                backgroundColor: activeTabId === tab.id ? '#4a90e2' : '#eee',
                color: activeTabId === tab.id ? 'white' : 'black',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                userSelect: 'none',
                minWidth: 80,
              }}
              title="Double click to edit"
            >
              {tab.name}
            </button>
          )}
          {tab.empty && tab.id !== 1 && (
            <button
              onClick={() => onDeleteTab(tab.id)}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: '#ff6565',
                border: 'none',
                borderRadius: '50%',
                width: 20,
                height: 20,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              title="Delete tab (only empty tabs)"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {normalizedTabs.length < 5 && (
        <button
          onClick={onAddTab}
          style={{
            padding: '6px 12px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Add new tab"
        >
          +
        </button>
      )}
    </div>
  )
}
