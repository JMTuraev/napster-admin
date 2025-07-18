import React, { useState, useRef } from 'react'

// Format number with spaces
function numberWithSpaces(x) {
  if (!x) return ''
  let s = x.toString().replace(/\D/g, '')
  if (!s) return ''
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Parse number from input
function parseNumber(str) {
  if (str === undefined || str === null) return 0
  return Number(String(str).replace(/\D/g, ''))
}

export default function GoodsReceiptForm({ onClose, products }) {
  const [rows, setRows] = useState([
    { id: Date.now(), productId: '', qty: '', price: '' }
  ])
  const [hoveredRow, setHoveredRow] = useState(null)
  const [activeField, setActiveField] = useState({ idx: null, name: null })
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  const NET_FOTO = '/images/net-photo.png'

  // Handle input changes
  const handleChange = (rowIdx, field, value) => {
    if (field === 'qty' || field === 'price') {
      value = numberWithSpaces(value)
    }
    setRows(rows.map((row, idx) =>
      idx === rowIdx ? { ...row, [field]: value } : row
    ))
  }

  // Only allow add row if all rows are filled
  const allFilled = rows.every(
    row =>
      row.productId &&
      parseNumber(row.qty) > 0 &&
      parseNumber(row.price) > 0
  )

  // Add new row
  const handleAddRow = () => {
    if (!allFilled) return
    setRows([
      ...rows,
      { id: Date.now() + Math.random(), productId: '', qty: '', price: '' }
    ])
    setTimeout(() => {
      if (inputRefs.current[rows.length]) {
        inputRefs.current[rows.length].focus()
      }
    }, 50)
  }

  // Remove a row
  const handleRemoveRow = (rowIdx) => {
    setRows(rows.filter((_, idx) => idx !== rowIdx))
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allFilled) return

    setLoading(true)

    // Prepare rows for DB
    const items = rows.map(row => ({
      product_id: row.productId,
      qty: parseNumber(row.qty),
      buy_price: parseNumber(row.price),
    }))

    try {
      await window.api.invoke('goods-receipt/add', { items })
      alert('Приход muvaffaqиятли saqlandi!')
      onClose()
    } catch (err) {
      alert('Xatolik: Приход saqlanmadi')
    } finally {
      setLoading(false)
    }
  }

  // Calculate row total
  const calcTotal = (qty, price) => {
    const q = parseNumber(qty)
    const p = parseNumber(price)
    return q && p ? numberWithSpaces(q * p) : ''
  }

  // Get product info by ID
  const getProductInfo = (productId) =>
    products.find(p => String(p.id) === String(productId))

  const infoRow = hoveredRow != null ? rows[hoveredRow] : null
  const infoProduct = infoRow && infoRow.productId ? getProductInfo(infoRow.productId) : null
  const infoPrice = parseNumber(infoRow?.price)

  // Calculate total summary
  const totalQty = rows.reduce((sum, r) => sum + parseNumber(r.qty), 0)
  const totalSum = rows.reduce((sum, r) => sum + (parseNumber(r.qty) * parseNumber(r.price)), 0)

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 800,
        margin: '0 auto',
        borderRadius: 10,
        padding: 0,
        boxSizing: 'border-box',
        fontSize: 15,
        background: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          right: 30,
          top: 26,
          background: 'none',
          border: 'none',
          color: '#aaa',
          fontSize: 24,
          cursor: 'pointer',
          lineHeight: 1,
          zIndex: 10
        }}
        title="Yopish"
      >×</button>

      <div style={{
        color: '#b3e4ff',
        fontSize: 28,
        fontWeight: 600,
        marginTop: 30,
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 0.5
      }}>
        Новый приход — форма
      </div>

      {/* Table */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '38px 1.4fr 0.9fr 1fr 1fr 1fr 62px',
          gap: 8,
          fontWeight: 600,
          color: '#7caeff',
          marginBottom: 7,
          fontSize: 17,
          alignItems: 'center',
          justifyItems: 'center',
          width: '100%'
        }}>
          <div>№</div>
          <div>Товар</div>
          <div>Рисунок</div>
          <div>Кол-во</div>
          <div>Цена</div>
          <div>Итого</div>
          <div></div>
        </div>
        {/* Rows */}
        {rows.map((row, idx) => {
          const info = getProductInfo(row.productId)
          const imageSrc = info?.image && info.image.trim()
            ? info.image
            : (row.productId ? NET_FOTO : '')
          const isEmpty = !row.productId

          // Border color only on focus
          const getBorder = (name) =>
            (activeField.idx === idx && activeField.name === name)
              ? '2px solid #ffe394'
              : '1.2px solid transparent'

          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '38px 1.4fr 0.9fr 1fr 1fr 1fr 62px',
                gap: 8,
                alignItems: 'center',
                marginBottom: 4,
                fontSize: 16,
                width: '100%',
                justifyItems: 'center'
              }}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div style={{ fontWeight: 500, textAlign: 'center' }}>{idx + 1}</div>
              {/* Product select */}
              <select
                value={row.productId}
                onChange={e => handleChange(idx, 'productId', e.target.value)}
                style={{
                  padding: 6,
                  borderRadius: 7,
                  width: '97%',
                  fontSize: 15,
                  border: getBorder('productId'),
                  outline: 'none',
                  background: '#181a2a',
                  color: '#fff',
                  textAlign: 'center'
                }}
                required
                onFocus={() => setActiveField({ idx, name: 'productId' })}
                onBlur={() => setActiveField({ idx: null, name: null })}
              >
                <option value="">Выберите...</option>
                {products.map(p =>
                  <option key={p.id} value={p.id}>{p.name}</option>
                )}
              </select>
              {/* Image */}
              <div style={{
                width: 40, height: 40, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                background: 'none', border: 'none'
              }}>
                {!isEmpty && imageSrc ? (
                  <img src={imageSrc} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                ) : (
                  <span style={{
                    color: '#818298', fontSize: 20, userSelect: 'none'
                  }}>-</span>
                )}
              </div>
              {/* Qty */}
              <input
                ref={el => inputRefs.current[idx] = el}
                type="text"
                value={row.qty}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '')
                  v = numberWithSpaces(v)
                  handleChange(idx, 'qty', v)
                }}
                placeholder="Сони"
                inputMode="numeric"
                style={{
                  padding: 6,
                  borderRadius: 7,
                  width: '95%',
                  fontSize: 15,
                  border: getBorder('qty'),
                  background: '#22244d',
                  color: '#fff',
                  textAlign: 'center',
                  outline: 'none'
                }}
                disabled={isEmpty}
                maxLength={11}
                onFocus={() => setActiveField({ idx, name: 'qty' })}
                onBlur={() => setActiveField({ idx: null, name: null })}
              />
              {/* Price */}
              <input
                type="text"
                value={row.price}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '')
                  v = numberWithSpaces(v)
                  handleChange(idx, 'price', v)
                }}
                placeholder="Цена"
                inputMode="numeric"
                style={{
                  padding: 6,
                  borderRadius: 7,
                  width: '95%',
                  fontSize: 15,
                  border: getBorder('price'),
                  background: '#22244d',
                  color: '#fff',
                  textAlign: 'center',
                  outline: 'none'
                }}
                disabled={isEmpty}
                maxLength={11}
                onFocus={() => setActiveField({ idx, name: 'price' })}
                onBlur={() => setActiveField({ idx: null, name: null })}
              />
              {/* Itogo */}
              <div style={{
                fontWeight: 600,
                color: isEmpty ? '#848494' : '#76e7aa',
                fontSize: 16,
                background: 'none',
                textAlign: 'center'
              }}>
                {isEmpty ? '-' : (row.qty && row.price ? calcTotal(row.qty, row.price) : '-')}
              </div>
              {/* Buttons column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 44,
                gap: 2
              }}>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f44',
                      fontSize: 18,
                      cursor: 'pointer',
                      margin: 0,
                      padding: 0,
                      width: 22,
                      height: 22,
                      lineHeight: '22px'
                    }}
                    title="Ўчириш"
                  >×</button>
                )}
                {idx === rows.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddRow}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: allFilled ? '#1976d2' : '#818298',
                      fontSize: 20,
                      cursor: allFilled ? 'pointer' : 'not-allowed',
                      margin: 0,
                      padding: 0,
                      width: 22,
                      height: 22,
                      lineHeight: '22px',
                      pointerEvents: allFilled ? 'auto' : 'none',
                      opacity: allFilled ? 1 : 0.4
                    }}
                    title="Янги қатор қўшиш"
                  >+</button>
                )}
              </div>
            </div>
          )
        })}
        {rows.length > 1 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '38px 1.4fr 0.9fr 1fr 1fr 1fr 62px',
              gap: 8,
              alignItems: 'center',
              marginTop: 12,
              fontSize: 16,
              width: '100%',
              justifyItems: 'center',
              fontWeight: 600,
              color: '#80ffb8',
              borderTop: '1px solid #282a3e',
              paddingTop: 10
            }}
          >
            <div></div>
            <div>Jami:</div>
            <div></div>
            <div>{numberWithSpaces(totalQty)}</div>
            <div></div>
            <div>{numberWithSpaces(totalSum)}</div>
            <div></div>
          </div>
        )}
      </div>

      {/* Info & submit */}
      <div style={{
        marginTop: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{ flex: 1, minHeight: 24, color: '#e2f2ff', fontSize: 15, fontWeight: 500, textAlign: 'left' }}>
          {(hoveredRow != null && infoProduct) ? (
            <>
              Остатка: <b>{infoProduct?.remain || 0}</b>
              <span style={{ marginLeft: 16 }}>Сотув нархи: <b>{infoProduct?.sell_price?.toLocaleString() || 0} сум</b></span>
              <span style={{ marginLeft: 16 }}>
                Маржа: <b>{infoProduct?.sell_price && infoPrice ? (((infoProduct.sell_price - infoPrice) / infoPrice) * 100).toFixed(1) + '%' : '-'}</b>
              </span>
            </>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={!allFilled || loading}
          style={{
            background: '#13dd60',
            color: '#fff',
            border: 'none',
            padding: '11px 32px',
            borderRadius: 9,
            fontSize: 18,
            fontWeight: 700,
            cursor: !allFilled ? 'not-allowed' : 'pointer',
            opacity: !allFilled || loading ? 0.6 : 1,
            minWidth: 140,
            marginLeft: 18
          }}>
          {loading ? 'Yozilmoqda...' : 'Добавить'}
        </button>
      </div>
    </form>
  )
}
