// src/pages/bar/OrderList.jsx
import React from 'react'

export default function OrderList({ orders, items, onChangeStatus }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ color: '#f8b400', marginBottom: 12 }}>Заказы</h3>
      {orders.filter(order => order.status === 'Не оплачен').length === 0 && (
        <div style={{ color: '#b0b9d5', fontStyle: 'italic', fontSize: 16 }}>
          Нет активных заказов
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {orders
          .filter(order => order.status === 'Не оплачен')
          .map(order => (
            <div key={order.id}
              style={{
                background: '#23243e',
                borderRadius: 12,
                color: '#fff',
                padding: 16,
                width: 260,
                boxShadow: '0 2px 8px #191e3a40',
                position: 'relative'
              }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Товары:</div>
              <div style={{ marginBottom: 8 }}>
                {order.items.map((orderItem, idx) => {
                  const item = items.find(i => i.id === orderItem.item_id)
                  return (
                    <div key={orderItem.item_id} style={{ marginBottom: 4, paddingLeft: 4 }}>
                      <span style={{ fontWeight: 500 }}>
                        {item ? item.name : "Товар"}
                      </span>
                      {' — '}
                      <span>
                        {orderItem.quantity} шт x {orderItem.price} сум
                        {' = '}
                        <b>{orderItem.quantity * orderItem.price} сум</b>
                      </span>
                    </div>
                  )
                })}
              </div>
              <div>Стол: <b>{order.stol || '-'}</b></div>
              <div>Дата: {order.date}</div>
              <div>
                Статус:
                <span style={{
                  background: '#fa5252',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '2px 9px',
                  marginLeft: 6,
                  fontWeight: 600
                }}>{order.status}</span>
              </div>
              {/* Итоговая сумма по всем товарам */}
              <div style={{ margin: '8px 0', fontWeight: 600 }}>
                Общая сумма:&nbsp;
                <span style={{ color: '#f8b400' }}>
                  {order.items.reduce((sum, i) => sum + i.quantity * i.price, 0)} сум
                </span>
              </div>
              <div style={{ marginTop: 9, display: 'flex', gap: 7 }}>
                <button
                  style={{
                    background: '#50fa7b', color: '#111', border: 'none',
                    borderRadius: 6, padding: '3px 10px', fontWeight: 700
                  }}
                  onClick={() => onChangeStatus(order.id, 'Оплачен')}
                >Оплачен</button>
                <button
                  style={{
                    background: '#999', color: '#111', border: 'none',
                    borderRadius: 6, padding: '3px 10px', fontWeight: 700
                  }}
                  onClick={() => onChangeStatus(order.id, 'Отказ')}
                >Отказ</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
