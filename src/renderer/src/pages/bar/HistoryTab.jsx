import React, { useState, useMemo } from 'react'
import HistoryFilter from './components/HistoryFilter'

const statusLabels = ['Оплачен', 'Не оплачен', 'Отказ']

// Sana filter yordamchi funksiyasi (parseDateString foydalansa aniqroq)
function parseDateString(dateStr) {
  // 13.07.2025, 15:58:01 ko‘rinishidagi sana uchun
  if (!dateStr) return new Date(NaN)
  const [date, time] = dateStr.split(', ')
  const [day, month, year] = date.split('.').map(Number)
  if (!time) return new Date(year, month - 1, day)
  const [h, m, s] = time.split(':').map(Number)
  return new Date(year, month - 1, day, h, m, s)
}
function getFilteredOrders(orders, filter) {
  const now = new Date();
  if (filter === "all") return orders;
  if (filter === "today") {
    return orders.filter(o => {
      const d = parseDateString(o.date)
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    })
  }
  if (filter === "yesterday") {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    return orders.filter(o => {
      const d = parseDateString(o.date)
      return (
        d.getFullYear() === yesterday.getFullYear() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getDate() === yesterday.getDate()
      )
    })
  }
  if (filter === "week") {
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    return orders.filter(o => parseDateString(o.date) >= weekAgo)
  }
  if (filter === "month") {
    const monthAgo = new Date(now)
    monthAgo.setMonth(now.getMonth() - 1)
    return orders.filter(o => parseDateString(o.date) >= monthAgo)
  }
  return orders
}

export default function HistoryTab({ orders, items, onChangeStatus }) {
  const [modalOrder, setModalOrder] = useState(null)
  const [filter, setFilter] = useState("all")

  // Filterlangan buyurtmalar
  const filteredOrders = useMemo(() => getFilteredOrders(orders, filter), [orders, filter]);

  // Итоги status bo‘yicha
  const oplachenSum = filteredOrders
    .filter(o => o.status === "Оплачен")
    .reduce((sum, o) => sum + (Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity * i.price), 0) : (o.total || 0)), 0)

  const neOplachenSum = filteredOrders
    .filter(o => o.status === "Не оплачен")
    .reduce((sum, o) => sum + (Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity * i.price), 0) : (o.total || 0)), 0)

  const otkazSum = filteredOrders
    .filter(o => o.status === "Отказ")
    .reduce((sum, o) => sum + (Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity * i.price), 0) : (o.total || 0)), 0)

  // Modal uchun handler
  const handleRowClick = (order) => setModalOrder(order)
  const handleCloseModal = () => setModalOrder(null)

  return (
    <div style={{ margin: "18px 0 0 0" }}>
      {/* Filter */}
      <HistoryFilter value={filter} onChange={setFilter} />

      {/* Итог сумма bo‘yicha statuslar */}
      <div style={{
        display: "flex", gap: 26, justifyContent: "flex-end", marginBottom: 8
      }}>
        <div style={{ color: "#7ff887", fontWeight: 700 }}>
          Оплачен: <span style={{ fontWeight: 800 }}>{oplachenSum.toLocaleString()} сум</span>
        </div>
        <div style={{ color: "#ffe066", fontWeight: 700 }}>
          Не оплачен: <span style={{ fontWeight: 800 }}>{neOplachenSum.toLocaleString()} сум</span>
        </div>
        <div style={{ color: "#ff6868", fontWeight: 700 }}>
          Отказ: <span style={{ fontWeight: 800 }}>{otkazSum.toLocaleString()} сум</span>
        </div>
      </div>

      <table style={{
        width: '100%', color: '#fff', borderCollapse: 'collapse', background: "#23243e",
        marginBottom: 28, borderRadius: 16, overflow: "hidden"
      }}>
        <thead>
          <tr style={{ background: "#23243e" }}>
            <th style={thStyle}>Дата</th>
            <th style={thStyle}>Стол</th>
            <th style={thStyle}>Чек сумма</th>
            <th style={thStyle}>Статус</th>
            <th style={thStyle}>Изменить</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr
              key={order.id}
              style={{
                borderBottom: '1px solid #181939', cursor: 'pointer', background: "#23244a"
              }}
              onClick={() => handleRowClick(order)}
              title="Кликните для подробностей"
            >
              <td style={tdStyle}>{order.date}</td>
              <td style={tdStyle}>{order.stol?.trim() ? order.stol : 'бар'}</td>
              <td style={{
                ...tdStyle,
                fontWeight: 700,
                color: "#7cf"
              }}>
                {(Array.isArray(order.items)
                  ? order.items.reduce((sum, i) => sum + (i.quantity * i.price), 0)
                  : (order.total || 0)
                ).toLocaleString()} сум
              </td>
              <td style={{
                ...tdStyle,
                fontWeight: 700,
                color: order.status === "Оплачен"
                  ? "#7ff887"
                  : order.status === "Не оплачен"
                    ? "#ffe066"
                    : "#ff6868"
              }}>
                {order.status}
              </td>
              <td style={tdStyle} onClick={e => e.stopPropagation()}>
                <select
                  value={order.status}
                  onChange={e => onChangeStatus(order.id, e.target.value)}
                  style={{
                    padding: 4, borderRadius: 6, background: "#252a3c", color: "#fff"
                  }}
                >
                  {statusLabels.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal oynacha */}
      {modalOrder && (
        <Modal onClose={handleCloseModal}>
          <Receipt order={modalOrder} items={items} />
        </Modal>
      )}
    </div>
  )
}

// Table style helper
const thStyle = {
  padding: "10px 14px",
  background: "#252a4e",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 16
}
const tdStyle = {
  padding: "8px 14px",
  fontSize: 15
}

// Modal (universal)
function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", zIndex: 99, left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        minWidth: 350, maxWidth: 420, background: "#22244a", borderRadius: 16, padding: 28, position: "relative",
        boxShadow: "0 6px 40px #0008"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, background: "#ff3a63", color: "#fff", border: "none",
            borderRadius: "50%", width: 30, height: 30, fontWeight: 900, fontSize: 22, cursor: "pointer"
          }}
          aria-label="Yopish"
        >×</button>
        {children}
      </div>
    </div>
  )
}

// Chek detallarini modalda ko‘rsatish
function Receipt({ order, items }) {
  return (
    <div>
      <h3 style={{ color: '#6cb5ff', marginBottom: 8, textAlign: "center" }}>Чек</h3>
      <div style={{ marginBottom: 8, fontSize: 16 }}>
        <b>Дата:</b> {order.date}
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>Стол:</b> {order.stol?.trim() ? order.stol : "бар"}
      </div>
      <div>
        <b>Список товаров:</b>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {Array.isArray(order.items) ? order.items.map((oi, idx) => {
            const item = items.find(i => i.id === oi.item_id)
            return (
              <li key={idx} style={{ marginBottom: 2 }}>
                {item?.name || "Товар"} — <b>{oi.quantity}</b> x {oi.price} = <b>{oi.quantity * oi.price} сум</b>
              </li>
            )
          }) : <li>Нет данных</li>}
        </ul>
      </div>
      <div style={{ marginTop: 10, fontWeight: 600, color: "#4ff" }}>
        Сумма чека: {Array.isArray(order.items)
          ? order.items.reduce((sum, i) => sum + (i.quantity * i.price), 0).toLocaleString()
          : (order.total || 0).toLocaleString()
        } сум
      </div>
      <div style={{ marginTop: 14 }}>
        <b>Статус:</b> <span style={{
          background: order.status === "Оплачен" ? "#5ff787" : order.status === "Отказ" ? "#ff6868" : "#ffe066",
          color: "#111", borderRadius: 5, padding: "3px 12px", fontWeight: 600
        }}>{order.status}</span>
      </div>
    </div>
  )
}
