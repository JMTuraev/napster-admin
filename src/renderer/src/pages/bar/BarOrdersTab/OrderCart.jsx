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

  const items = cart.map(item => {
    const prod = products.find(p => p.id === item.productId)
    return {
      ...item,
      name: prod ? prod.name : '...',
      price: prod ? prod.sell_price : 0
    }
  })
  const totalSum = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const handleRemove = (productId) => {
    setCart(cart.filter(i => i.productId !== productId))
  }

  const handleChangeQty = (productId, newQty) => {
    setCart(cart.map(i =>
      i.productId === productId ? { ...i, qty: newQty < 1 ? 1 : newQty } : i
    ))
  }

  return (
    <div style={orderCardStyle}>
      {/* Cart items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <div key={item.productId} style={{
            display: 'flex', alignItems: 'center', background: '#202538',
            borderRadius: 8, padding: '10px 19px 10px 11px', gap: 15,
            boxShadow: '0 2px 10px #23243a16', fontSize: 16.5, fontWeight: 600,
            transition: 'background 0.14s, box-shadow 0.13s'
          }}>
            <span style={{ color: '#fff', minWidth: 90 }}>{item.name}</span>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={e => handleChangeQty(item.productId, Number(e.target.value))}
              style={{
                width: 38, borderRadius: 6, border: '1px solid #2d3b5a',
                padding: '2px 8px', fontSize: 15, background: '#232543', color: '#e3f7ff'
              }}
            />
            <span style={{ color: '#ffe398', fontWeight: 600, minWidth: 86, textAlign: 'right' }}>
              {item.price.toLocaleString()} сум
            </span>
            <button
              onClick={() => handleRemove(item.productId)}
              style={{
                background: 'none', border: 'none', color: '#ff7676', fontSize: 23,
                marginLeft: 6, cursor: 'pointer', fontWeight: 700
              }}
              title="Удалить"
            >×</button>
          </div>
        ))}
      </div>
      {/* Total and zakaz button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
      }}>
        <span style={{
          color: '#9cffc2', fontWeight: 800, fontSize: 19, minWidth: 100,
        }}>
          {`Итого: ${totalSum.toLocaleString()} сум`}
        </span>
        <button
          onClick={onOrder}
          style={{
            background: 'linear-gradient(90deg, #1ecdc1 0%, #1d67ff 100%)',
            color: '#182435',
            border: 'none', borderRadius: 9, padding: '12px 38px',
            fontWeight: 700, fontSize: 18, boxShadow: '0 2px 10px #1622322a', cursor: 'pointer',
            transition: 'background 0.16s, color 0.16s, box-shadow 0.14s'
          }}
        >
          Заказать
        </button>
      </div>
    </div>
  )
}
