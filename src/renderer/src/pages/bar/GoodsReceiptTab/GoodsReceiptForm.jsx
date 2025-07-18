import React, { useState } from 'react'

export default function GoodsReceiptForm({ onClose, products }) {
  const [rows, setRows] = useState([
    { id: Date.now(), productId: '', qty: '', price: '' }
  ])
  const [hoveredRow, setHoveredRow] = useState(null)

  const NET_FOTO = '/images/net-photo.png'

  const handleChange = (rowIdx, field, value) => {
    setRows(rows.map((row, idx) =>
      idx === rowIdx ? { ...row, [field]: value } : row
    ))
  }

  const handleAddRow = () => {
    setRows([
      ...rows,
      { id: Date.now() + Math.random(), productId: '', qty: '', price: '' }
    ])
  }

  const handleRemoveRow = (rowIdx) => {
    setRows(rows.filter((_, idx) => idx !== rowIdx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Приход muvaffaqiyatли! (Keyin real saqlash)')
    onClose()
  }

  const calcTotal = (qty, price) => {
    const q = Number(qty)
    const p = Number(price)
    return (q && p) ? (q * p) : ''
  }

  const getProductInfo = (productId) => products.find(p => String(p.id) === String(productId))

  // Info panel uchun
  const infoRow = hoveredRow != null ? rows[hoveredRow] : null
  const infoProduct = infoRow && infoRow.productId ? getProductInfo(infoRow.productId) : null
  const infoPrice = infoRow?.price

  return (
    <form onSubmit={handleSubmit}
      style={{
        background: '#181a2a', borderRadius: 10, padding: '32px 38px', minHeight: 380, position: 'relative',
        maxWidth: 1100, margin: '0 auto', boxSizing: 'border-box', fontSize: 16
      }}>
      <button type="button" onClick={onClose}
        style={{
          position: 'absolute', right: 24, top: 18, background: 'none', border: 'none', color: '#aaa', fontSize: 22, cursor: 'pointer'
        }}>×</button>
      <div style={{ color: '#b3e4ff', fontSize: 26, fontWeight: 500, marginBottom: 22 }}>
        Новый приход — форма
      </div>
      {/* Jadval sarlavhalari */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1.5fr 1fr 1fr 1fr 1fr 0.5fr 34px',
        gap: 7,
        fontWeight: 600,
        color: '#7caeff',
        marginBottom: 7,
        fontSize: 18,
        alignItems: 'center'
      }}>
        <div>№</div>
        <div>Товар</div>
        <div>Рисунок</div>
        <div>Кол-во</div>
        <div>Цена (1 шт)</div>
        <div>Итого</div>
        <div></div>
        <div></div>
      </div>
      <div style={{ minHeight: 90 }}>
        {rows.map((row, idx) => {
          const info = getProductInfo(row.productId)
          const imageSrc = info?.image && info.image.trim()
            ? info.image
            : (row.productId ? NET_FOTO : '')
          // Проверяем: Выберите... bo‘lsa faqat '-'
          const isEmpty = !row.productId
          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1.5fr 1fr 1fr 1fr 1fr 0.5fr 34px',
                gap: 7,
                alignItems: 'center',
                marginBottom: 6,
                fontSize: 17,
                background: 'none'
                // border, bg yo‘q!
              }}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div style={{ fontWeight: 500 }}>{idx + 1}</div>
              {/* Tovar select */}
              <select
                value={row.productId}
                onChange={e => handleChange(idx, 'productId', e.target.value)}
                style={{
                  padding: 6, borderRadius: 8, width: '100%', fontSize: 16,
                  border: '1.5px solid #ffe394', outline: 'none', background: '#181a2a', color: '#fff'
                }}
                required
              >
                <option value="">Выберите...</option>
                {products.map(p =>
                  <option key={p.id} value={p.id}>{p.name}</option>
                )}
              </select>
              {/* Rasm */}
              <div style={{
                width: 64, height: 64, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                background: 'none', border: 'none'
              }}>
                {!isEmpty && imageSrc ? (
                  <img src={imageSrc} alt="" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                ) : (
                  <span style={{
                    color: '#818298', fontSize: 24, userSelect: 'none'
                  }}>-</span>
                )}
              </div>
              {/* Kolicestvo */}
              <input
                type="number"
                min={1}
                value={row.qty}
                onChange={e => handleChange(idx, 'qty', e.target.value)}
                placeholder="Сони"
                style={{
                  padding: 6, borderRadius: 8, width: '93%', fontSize: 16,
                  border: 'none', background: '#22244d', color: '#fff', textAlign: 'center'
                }}
                disabled={isEmpty}
              />
              {/* Narx */}
              <input
                type="number"
                min={1}
                value={row.price}
                onChange={e => handleChange(idx, 'price', e.target.value)}
                placeholder="Цена"
                style={{
                  padding: 6, borderRadius: 8, width: '93%', fontSize: 16,
                  border: 'none', background: '#22244d', color: '#fff', textAlign: 'center'
                }}
                disabled={isEmpty}
              />
              {/* Itogo */}
              <div style={{
                fontWeight: 600, color: isEmpty ? '#848494' : '#76e7aa', fontSize: 17,
                background: 'none', textAlign: 'center'
              }}>
                {isEmpty ? '-' : (row.qty && row.price ? calcTotal(row.qty, row.price) : '-')}
              </div>
              <div></div>
              {/* + (add new row) */}
              <div style={{ display: 'flex', gap: 2 }}>
                {idx === rows.length - 1 && (
                  <button type="button" onClick={handleAddRow}
                    style={{
                      background: 'none', border: 'none', color: '#1d67ff', fontSize: 23,
                      cursor: 'pointer', fontWeight: 800, padding: 0, lineHeight: 1
                    }}
                    tabIndex={-1}
                    title="Янги қатор қўшиш"
                  >+</button>
                )}
                {rows.length > 1 && (
                  <button type="button" onClick={() => handleRemoveRow(idx)}
                    style={{
                      background: 'none', border: 'none', color: '#f44', fontSize: 18, cursor: 'pointer', marginLeft: 2
                    }}
                    tabIndex={-1}
                    title="Ўчириш"
                  >×</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* InfoPanel va button yonma-yon */}
      <div style={{
        marginTop: 24, display: 'flex',
        justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 62
      }}>
        {/* InfoPanel — faqat qator hover bo‘lsa va product tanlangan bo‘lsa */}
        {(hoveredRow != null && infoProduct) ? (
          <div style={{
            color: '#e2f2ff', padding: '6px 0',
            fontSize: 15, fontWeight: 500, lineHeight: 1.7, minWidth: 140, whiteSpace: 'nowrap'
          }}>
            <span style={{ marginRight: 30 }}>
              Остатка: <b>{infoProduct?.remain || 0}</b>
            </span>
            <span style={{ marginRight: 30 }}>
              Сотув нархи: <b>{infoProduct?.sell_price?.toLocaleString() || 0} сум</b>
            </span>
            <span>
              Маржа: <b>{infoProduct?.sell_price && infoPrice ? (((infoProduct.sell_price - infoPrice) / infoPrice) * 100).toFixed(1) + '%' : '-'}</b>
            </span>
          </div>
        ) : (
          <div style={{ minHeight: 24 }}></div>
        )}
        <button type="submit"
          style={{
            background: '#13dd60', color: '#fff', border: 'none',
            padding: '9px 26px', borderRadius: 8, fontSize: 17, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.17s', minWidth: 120
          }}>
          Добавить
        </button>
      </div>
    </form>
  )
}
