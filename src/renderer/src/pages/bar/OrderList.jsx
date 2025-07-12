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
        {orders.filter(order => order.status === 'Не оплачен').map(order => {
          const item = items.find(i => i.id === order.itemId)
          return (
            <div key={order.id}
              style={{
                background: '#23243e',
                borderRadius: 12,
                color: '#fff',
                padding: 16,
                width: 220,
                boxShadow: '0 2px 8px #191e3a40',
                position: 'relative'
              }}>
              <div style={{ fontWeight: 600 }}>{item ? item.name : "Товар"}</div>
              <div>Стол: <b>{order.stol || '-'}</b></div>
              <div>Кол-во: <b>{order.quantity}</b></div>
              <div>Цена: <b>{order.price} сум</b></div>
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
          )
        })}
      </div>
    </div>
  )
}
