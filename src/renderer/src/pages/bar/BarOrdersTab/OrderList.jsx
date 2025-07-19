import React from 'react'

// orderCardStyle universal card uchun
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

// Scrollbar uchun style - har doim project global style'iga joylang
const customScrollbarStyle = `
.orders-list-scroll {
  scrollbar-width: thin;
  scrollbar-color: #2a334b #131728;
}
.orders-list-scroll::-webkit-scrollbar {
  width: 6px;
  background: #1a1f33;
}
.orders-list-scroll::-webkit-scrollbar-thumb {
  background: #2a334b;
  border-radius: 6px;
}
.orders-list-scroll::-webkit-scrollbar-thumb:hover {
  background: #385585;
}
`;

export default function OrdersList({ orders = [], cartCard = null }) {
  // Scrollbar stilini bir marta DOM'ga qo'shamiz
  React.useEffect(() => {
    if (!document.getElementById('orders-scrollbar-style')) {
      const style = document.createElement('style')
      style.id = 'orders-scrollbar-style'
      style.innerHTML = customScrollbarStyle
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div
      style={{
        background: '#1a1f33',
        borderRadius: 13,
        padding: '22px 22px 18px 18px',
        minHeight: 320,
        minWidth: 350,
        boxShadow: '0 2px 18px #1d223933',
        color: '#e3e8ff',
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 19, color: '#7ed0fa', marginBottom: 16 }}>
        Заказы
      </div>
      {cartCard && (
        <div style={{ marginBottom: 16 }}>
          {React.cloneElement(cartCard, { cardStyle: orderCardStyle })}
        </div>
      )}
      <div
        className="orders-list-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingRight: 0,
          paddingBottom: 100, // <-- 24 + 30px, pastdan joy uchun
        }}
      >
        {(!orders || !orders.length) ? (
          <div style={{ color: '#9cb2ca', fontSize: 15, padding: 20, textAlign: 'center' }}>
            Buyurtmalar hali yo‘q
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              style={orderCardStyle}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6
              }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#ffb366' }}>
                  № {order.id}
                </div>
                <div style={{ color: '#9ad6fc', fontSize: 14 }}>
                  {order.user ? order.user : `Кomp №${order.computer}`}
                </div>
                <div>
                  <span style={{
                    fontWeight: 600,
                    color:
                      order.status === 'не оплачен'
                        ? '#ffe098'
                        : order.status === 'оплачен'
                          ? '#8ef7a8'
                          : '#ffbaba',
                    background:
                      order.status === 'не оплачен'
                        ? 'rgba(255, 230, 152, 0.13)'
                        : order.status === 'оплачен'
                          ? 'rgba(142, 247, 168, 0.13)'
                          : 'rgba(255, 186, 186, 0.13)',
                    padding: '2.5px 12px',
                    borderRadius: 8,
                    marginLeft: 6,
                    fontSize: 14,
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 14.6, marginBottom: 6 }}>
                {order.items.map((item, idx) => (
                  <div key={item.id || idx} style={{
                    display: 'flex', gap: 12, alignItems: 'center'
                  }}>
                    <span style={{ minWidth: 19, color: '#aac3e6' }}>{idx + 1}.</span>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: '#ffe098', marginLeft: 10 }}>x{item.qty}</span>
                    <span style={{ color: '#99fff8', marginLeft: 10 }}>
                      {item.price.toLocaleString()} сум
                    </span>
                    <span style={{ color: '#e8ff8f', marginLeft: 10 }}>
                      {item.sum.toLocaleString()} сум
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7
              }}>
                <div style={{ color: '#97a2b8', fontSize: 13 }}>{order.created_at}</div>
                <div style={{ fontWeight: 600, color: '#77ffd2', fontSize: 15 }}>
                  Jami: {order.total.toLocaleString()} сум
                </div>
              </div>
              {order.status === 'не оплачен' && (
                <div style={{
                  display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end'
                }}>
                  <button
                    style={{
                      background: '#1ecc8c', color: '#14232d', border: 'none', borderRadius: 7,
                      padding: '6px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer'
                    }}
                  >Оплачен</button>
                  <button
                    style={{
                      background: '#ff6f6f', color: '#fff', border: 'none', borderRadius: 7,
                      padding: '6px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer'
                    }}
                  >Отказ</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
