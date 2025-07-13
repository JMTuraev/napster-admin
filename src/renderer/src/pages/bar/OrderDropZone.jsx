import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export default function OrderDropZone({ onDrop, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'order-drop-zone'
  })

  // Bu event dnd-context da onDragEnd da olinadi
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 120,
        background: isOver ? '#21234a77' : undefined,
        border: isOver ? '2px dashed #6cb5ff' : '2px solid transparent',
        borderRadius: 16,
        transition: 'background .14s, border .14s'
      }}
    >
      {children}
      {isOver && <div style={{
        textAlign: 'center', color: '#6cb5ff',
        fontWeight: 600, fontSize: 17
      }}>Бросьте товар для заказа</div>}
    </div>
  )
}
