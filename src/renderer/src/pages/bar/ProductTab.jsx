// src/pages/bar/ProductTab.jsx
import React from 'react'
import BarList from './BarList'

export default function ProductTab({ items, onEdit, onDelete, onAdd }) {
  return (
    <div>
      <button onClick={onAdd} style={addBtnStyle}>+ Товар</button>
      <BarList items={items} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

const addBtnStyle = {
  marginBottom: 18,
  background: '#1b263b',
  color: '#fff',
  border: 'none',
  padding: '10px 22px',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 16
}
