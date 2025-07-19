import React from 'react'

const orderCardStyle = {
  background: '#181926',
  borderRadius: 9,
  boxShadow: '0 2px 8px #23243a33',
  padding: '13px 18px 10px 13px',
  position: 'relative',
  width: '100%',
  marginBottom: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 12
}

export default function OrderCart({ cart, setCart, products, onOrder }) {
  if (!cart || !cart.length) return null

  // Helper: idlarni universal taqqoslash
  const findProduct = (id) => products.find(p => String(p.id) === String(id))

  // Mahsulotlarni cart bilan boyitish (o‘chirilgan bo‘lsa ham!)
  const items = cart.map(item => {
    const prod = findProduct(item.productId)
    return {
      ...item,
      name: prod ? prod.name : '(удалённый товар)',
      price: prod ? prod.sell_price : 0
    }
  })

  // Total sum, qty ni har doim 1 dan katta qilish
  const totalSum = items.reduce((sum, item) =>
    sum + (Number(item.price) || 0) * (Number(item.qty) > 0 ? Number(item.qty) : 1)
  , 0)

  // O‘chirish
  const handleRemove = (productId) => {
    setCart(cart.filter(i => String(i.productId) !== String(productId)))
  }

  // Faqat raqam, max 5 raqam, bo‘sh yoki 0 bo‘lsa 1 qilib yozish
  const handleChangeQty = (productId, newQtyRaw) => {
    // Faqat raqamlarni qoldiramiz
    let newQty = String(newQtyRaw).replace(/[^\d]/g, '')
    // Max 5 ta raqam
    if (newQty.length > 5) newQty = newQty.slice(0, 5)
    // Bo‘sh bo‘lsa 1
    if (!newQty || Number(newQty) < 1) newQty = '1'

    setCart(cart.map(i =>
      String(i.productId) === String(productId)
        ? { ...i, qty: Number(newQty) }
        : i
    ))
  }

  return (
    <div style={orderCardStyle}>
      {/* Cart items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div key={item.productId} style={{
            display: 'flex', alignItems: 'center', background: '#202538',
            borderRadius: 8, padding: '7px 13px 7px 10px', gap: 13,
            boxShadow: '0 2px 10px #23243a16', fontSize: 14, fontWeight: 600,
            transition: 'background 0.14s, box-shadow 0.13s'
          }}>
            <span
              style={{
                color: item.name === '(удалённый товар)' ? '#e68080' : '#fff',
                minWidth: 0,
                maxWidth: 110,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'inline-block',
                fontSize: 14.5,
                fontWeight: 700
              }}
              title={item.name}
            >
              {item.name}
            </span>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={item.qty}
              onChange={e => handleChangeQty(item.productId, e.target.value)}
              style={{
                width: 32, borderRadius: 5, border: '1px solid #2d3b5a',
                padding: '2px 5px', fontSize: 13, background: '#232543', color: '#e3f7ff',
                textAlign: 'center', outline: 'none'
              }}
              maxLength={5}
              title="Soni"
              autoComplete="off"
            />
            <span style={{
              color: item.price ? '#ffe398' : '#ffacac',
              fontWeight: 600, minWidth: 70, textAlign: 'right', fontSize: 13
            }}>
              {item.price ? item.price.toLocaleString() : '-'} сум
            </span>
            <button
              onClick={() => handleRemove(item.productId)}
              style={{
                background: 'none', border: 'none', color: '#ff7676', fontSize: 17,
                marginLeft: 3, cursor: 'pointer', fontWeight: 700, lineHeight: 1
              }}
              title="Удалить"
              tabIndex={0}
            >×</button>
          </div>
        ))}
      </div>
      {/* Total and zakaz button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
      }}>
        <span style={{
          color: '#9cffc2', fontWeight: 800, fontSize: 15.5, minWidth: 70,
        }}>
          {`Итого: ${totalSum.toLocaleString()} сум`}
        </span>
        <button
          onClick={onOrder}
          style={{
            background: 'linear-gradient(90deg, #1ecdc1 0%, #1d67ff 100%)',
            color: '#182435',
            border: 'none', borderRadius: 8, padding: '7px 21px',
            fontWeight: 700, fontSize: 15, boxShadow: '0 2px 10px #1622322a', cursor: 'pointer',
            transition: 'background 0.16s, color 0.16s, box-shadow 0.14s'
          }}
        >
          Заказать
        </button>
      </div>
    </div>
  )
}
