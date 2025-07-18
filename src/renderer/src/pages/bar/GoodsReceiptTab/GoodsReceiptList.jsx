import React, { useEffect, useState } from 'react'

// Raqamlarni probel bilan chiqarish
function numberWithSpaces(x) {
  if (!x) return ''
  let s = x.toString().replace(/\D/g, '')
  if (!s) return ''
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Sana va vaqt formatlari
function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString('uz-UZ')
}
function formatTime(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

export default function GoodsReceiptList({ onSelect }) {
  const [prixods, setPrixods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchPrixods() {
      setLoading(true)
      setError('')
      try {
        const res = await window.api.invoke('goods-receipt/list')
        if (!cancelled) setPrixods(res || [])
      } catch (err) {
        if (!cancelled) setError('Maʼlumotlarni yuklab boʻlmadi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPrixods()
    return () => { cancelled = true }
  }, [])

  return (
    <div
      style={{
        background: '#181926',
        borderRadius: 10,
        padding: '12px 18px',
        minHeight: 140,
        width: '100%',
        boxShadow: '0 2px 12px #1b222833'
      }}
    >
      {loading ? (
        <div style={{ color: '#b0a9c6', fontSize: 15 }}>Yuklanmoqda...</div>
      ) : error ? (
        <div style={{ color: '#f66', fontSize: 15 }}>{error}</div>
      ) : prixods.length === 0 ? (
        <div style={{ color: '#b0a9c6', fontSize: 16 }}>Приходлар ҳали йўқ</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {prixods.map((p, idx) => (
            <div
              key={p.id}
              tabIndex={0}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: idx !== prixods.length - 1 ? '1px solid #23243a' : 'none',
                fontSize: 15.2,
                color: '#e1e6ff',
                transition: 'background .12s',
                gap: 7,
                cursor: 'pointer',
                borderRadius: 6,
                outline: 'none'
              }}
              onClick={() => onSelect && onSelect(p)}
              onKeyDown={e => (e.key === 'Enter' && onSelect && onSelect(p))}
              onMouseEnter={e => (e.currentTarget.style.background = '#21243b')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onFocus={e => (e.currentTarget.style.background = '#21243b')}
              onBlur={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontWeight: 700, minWidth: 55, color: '#69bcff', fontSize: 16 }}>№ {p.id}</div>
              <div style={{ minWidth: 90 }}>Товарлар: <b style={{ color: '#c0ffd2', fontWeight: 600 }}>{p.products}</b></div>
              <div style={{ minWidth: 76 }}>Сони: <b style={{ color: '#ffe098', fontWeight: 600 }}>{numberWithSpaces(p.totalQty)}</b></div>
              <div style={{ minWidth: 112 }}>Жами: <b style={{ color: '#a0f4f8', fontWeight: 600 }}>{numberWithSpaces(p.totalSum)} сум</b></div>
              <div style={{ fontWeight: 400, minWidth: 120, color: '#ffecc6', fontSize: 15, textAlign: 'right' }}>
                {p.created_at
                  ? (
                    <span>
                      {formatDate(p.created_at)}{' '}
                      <span style={{ color: '#8ca6cb', fontWeight: 500 }}>{formatTime(p.created_at)}</span>
                    </span>
                  ) : (p.date || '')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
