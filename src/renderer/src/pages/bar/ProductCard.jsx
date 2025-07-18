import React, { useState, useRef, useEffect } from 'react'

export default function ProductCard({ product, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const cardRef = useRef(null)

  // Tashqariga bosilsa menyuni yopish
  useEffect(() => {
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      ref={cardRef}
      style={{
        minWidth: 210, minHeight: 260, maxWidth: 230,
        background: 'linear-gradient(145deg,#171b34 80%,#232a4e 120%)',
        borderRadius: 16, boxShadow: '0 4px 14px #0002',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start', padding: '18px 13px 14px 13px',
        margin: 0, position: 'relative'
      }}
    >
      {/* 3 nuqta menyu */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          position: 'absolute', top: 10, right: 10, width: 28, height: 28,
          border: 'none', background: 'none', color: '#98a0c6', fontSize: 22,
          cursor: 'pointer', zIndex: 2, outline: 'none'
        }}
        tabIndex={-1}
        aria-label="More"
      >
        &#8942;
      </button>

      {/* Popover menyu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 36, right: 10,
          background: '#232a4e', border: '1.2px solid #2e385a',
          borderRadius: 8, boxShadow: '0 4px 18px #0002', minWidth: 110,
          zIndex: 10, display: 'flex', flexDirection: 'column',
        }}>
          <button
            onClick={() => { setMenuOpen(false); onEdit && onEdit(product) }}
            style={{
              background: 'none', border: 'none', color: '#69c6ff',
              fontWeight: 600, fontSize: 15, padding: '10px 0 7px 0',
              cursor: 'pointer', textAlign: 'left', paddingLeft: 18
            }}
          >Изменить</button>
          <button
            onClick={() => { setMenuOpen(false); onDelete && onDelete() }}
            style={{
              background: 'none', border: 'none', color: '#ff6384',
              fontWeight: 600, fontSize: 15, padding: '7px 0 10px 0',
              cursor: 'pointer', textAlign: 'left', paddingLeft: 18
            }}
          >Удалить</button>
        </div>
      )}

      {/* Mahsulot nomi */}
      <div style={{
        fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 10,
        textAlign: 'center', width: '100%'
      }}>{product.name}</div>

      {/* Rasm yoki "нет фото" */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'
      }}>
        {product.image ? (
          <img src={product.image} alt="img" style={{
            maxWidth: 90, maxHeight: 65, marginBottom: 4,
            borderRadius: 8, objectFit: 'cover', background: '#212653'
          }} />
        ) : (
          <div style={{
            width: 100, height: 38, background: '#242a4c',
            borderRadius: 7, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#7ea2e2', fontSize: 15, fontWeight: 400,
            marginBottom: 0
          }}>нет фото</div>
        )}
      </div>
    </div>
  )
}
