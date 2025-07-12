// src/pages/bar/BarStatsPage.jsx

import React from 'react'

// Funksiya: umumiy statistika hisoblash
function calculateStats(orders, items) {
  // Faqat "Оплачен" buyurtmalarni hisobga olamiz
  const paidOrders = orders.filter(o => o.status === 'Оплачен')
  const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0)
  const soldItemsCount = paidOrders.reduce((acc, o) => acc + o.quantity, 0)
  const totalOrders = orders.length

  // Har bir mahsulot bo‘yicha sotilgan son va tushum
  const itemStats = items.map(item => {
    const itemPaidOrders = paidOrders.filter(o => o.itemId === item.id)
    const sold = itemPaidOrders.reduce((acc, o) => acc + o.quantity, 0)
    const revenue = itemPaidOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0)
    return { ...item, sold, revenue }
  })

  return {
    totalRevenue,
    soldItemsCount,
    totalOrders,
    itemStats
  }
}

export default function BarStatsPage({ orders, items }) {
  const stats = calculateStats(orders, items)

  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ color: '#82faff', marginBottom: 24, fontSize: 24 }}>Бар • Статистика</h3>
      <div style={{
        display: 'flex',
        gap: 40,
        marginBottom: 34,
        flexWrap: 'wrap',
        fontSize: 18
      }}>
        <div>
          <div style={{ color: '#faeb50' }}>Всего чеков:</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{stats.totalOrders}</div>
        </div>
        <div>
          <div style={{ color: '#50fa7b' }}>Сумма продаж (итого):</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{stats.totalRevenue.toLocaleString()} сум</div>
        </div>
        <div>
          <div style={{ color: '#91caff' }}>Всего продано (штук):</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{stats.soldItemsCount}</div>
        </div>
      </div>
      <div style={{ marginTop: 30 }}>
        <h4 style={{ color: '#b5faff', marginBottom: 18 }}>Продажи по товарам:</h4>
        <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', background: '#21234a', borderRadius: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #353a65' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Товар</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Продано (шт)</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Сумма (сум)</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Остаток (шт)</th>
            </tr>
          </thead>
          <tbody>
            {stats.itemStats.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #353a65' }}>
                <td style={{ padding: 8 }}>{item.name}</td>
                <td style={{ textAlign: 'right', padding: 8 }}>{item.sold}</td>
                <td style={{ textAlign: 'right', padding: 8 }}>{item.revenue.toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: 8 }}>{item.remain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
