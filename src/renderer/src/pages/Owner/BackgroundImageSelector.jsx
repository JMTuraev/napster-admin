import React from 'react'
import { Plus, X } from 'lucide-react'

const MAX_IMAGES = 6

export default function BackgroundImageSelector({ images = [], onAdd, onRemove, selectedId, onSelect }) {
    console.log(images)
  return (
    <div style={{
      flex: 1,
      margin: '52px 40px 0 40px',
      padding: '20px 26px',
      background: 'rgba(22,24,44,0.88)',
      borderRadius: 20,
      boxShadow: '0 8px 28px #181b30cc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit'
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 18,
        color: '#fff',
        marginBottom: 22,
        letterSpacing: '0.4px'
      }}>
        Фон для клиента
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 20,
        minHeight: 230
      }}>
        {images.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => onSelect(img.id)}
            style={{
              position: 'relative',
              height: 100,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#0f111d',
              boxShadow: img.id === selectedId
                ? '0 0 0 2px #4bb0fa, 0 0 12px #4bb0fa88'
                : '0 0 0 1px #2a3251',
              transform: img.id === selectedId ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer'
            }}
          >
            <img
              src={img.url}
              alt={`bg-${idx}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            <div style={{
              position: 'absolute',
              top: 6,
              left: 8,
              background: '#00000088',
              color: '#fff',
              fontSize: 12,
              padding: '2px 6px',
              borderRadius: 8
            }}>{idx + 1}/{MAX_IMAGES}</div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(img.id)
              }}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: '#00000088',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                padding: 3,
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button onClick={onAdd} style={{
            height: 100,
            border: '2px dashed #4bb0fa66',
            borderRadius: 14,
            background: '#1c2030',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4bb0fa',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}>
            <Plus size={20} style={{ marginRight: 6 }} />
            Добавить
          </button>
        )}
      </div>
    </div>
  )
}
