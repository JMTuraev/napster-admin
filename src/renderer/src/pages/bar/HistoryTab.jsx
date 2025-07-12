// src/pages/bar/HistoryTab.jsx
import React from 'react'

const statusLabels = ['Оплачен', 'Не оплачен', 'Отказ']

export default function HistoryTab({ orders, items, onChangeStatus }) {
  return (
    <div>
      <h3 style={{ color: '#6cb5ff', marginBottom: 18 }}>История заказов</h3>
      <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Товар</th>
            <th>Стол</th>
            <th>Кол-во</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Изменить</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const item = items.find(i => i.id === order.itemId)
            return (
              <tr key={order.id} style={{ borderBottom: '1px solid #23243e' }}>
                <td>{order.date}</td>
                <td>{item?.name || '-'}</td>
                <td>{order.stol || '-'}</td>
                <td>{order.quantity}</td>
                <td>{order.price} сум</td>
                <td>{order.status}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={e => onChangeStatus(order.id, e.target.value, order.status)}
                  >
                    {statusLabels.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
