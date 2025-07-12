import React, { useState, useEffect } from 'react'
import BarList from './BarList'
import BarItemForm from './BarItemForm'
import OrderList from './OrderList'
import HistoryTab from './HistoryTab'
import BarStatsPage from './BarStatsPage'

export default function Bar() {
  // Real items va orders
  const [items, setItems] = useState([])
  const [orders, setOrders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  // --- DB bilan ishlash: ---
  // Bar itemlarni yuklash
  const fetchItems = async () => {
    const data = await window.api.invoke('bar-items/get')
    setItems(data || [])
  }
  // Buyurtmalarni yuklash
  const fetchOrders = async () => {
    const data = await window.api.invoke('bar-orders/get')
    setOrders(data || [])
  }
  useEffect(() => { fetchItems() }, [])
  useEffect(() => { fetchOrders() }, [])

  // --- CRUD funksiyalar ---
  const handleEdit = (item) => { setEditingItem(item); setShowForm(true) }
  const handleAdd = () => { setEditingItem(null); setShowForm(true) }
  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      await window.api.invoke('bar-items/delete', id)
      fetchItems()
    }
  }
  const handleSave = async (item) => {
    if (item.id) {
      await window.api.invoke('bar-items/update', item)
    } else {
      await window.api.invoke('bar-items/add', item)
    }
    setShowForm(false)
    fetchItems()
  }
  const handleCancel = () => setShowForm(false)

  // --- Buyurtma qo‘shish (admin test tugmasi uchun) ---
  const handleAddOrder = async () => {
    if (!items.length) return
    const item = items[Math.floor(Math.random() * items.length)]
    await window.api.invoke('bar-orders/add', {
      itemId: item.id,
      stol: Math.floor(Math.random() * 10) + 1,
      quantity: 1,
      price: item.price,
      status: 'Не оплачен',
      date: new Date().toLocaleString()
    })
    fetchOrders()
  }

  // --- Buyurtma statusini boshqarish ---
  const handleChangeOrderStatus = async (orderId, newStatus, prevStatus) => {
    await window.api.invoke('bar-orders/update-status', {
      id: orderId,
      status: newStatus,
      prevStatus: prevStatus
    })
    fetchOrders()
    fetchItems()
  }

  return (
    <div style={{ padding: 32 }}>
      {/* TABLAR */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={tabBtnStyle(activeTab === 'orders')}
        >Заказы</button>
        <button
          onClick={() => setActiveTab('history')}
          style={tabBtnStyle(activeTab === 'history')}
        >История</button>
        <button
          onClick={() => setActiveTab('stat')}
          style={tabBtnStyle(activeTab === 'stat')}
        >Статистика</button>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <BarItemForm
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* TABLAR */}
      {activeTab === 'orders' && (
        <>
          <button
            onClick={handleAdd}
            style={addBtnStyle()}
          >+ Товар</button>
          <button
            onClick={handleAddOrder}
            style={{ ...addBtnStyle(), marginLeft: 12, background: '#23243e', fontSize: 15, padding: '10px 18px' }}
          >+ Тест заказ</button>
          <BarList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          <OrderList
            orders={orders}
            items={items}
            onChangeStatus={handleChangeOrderStatus}
          />
        </>
      )}
      {activeTab === 'history' && (
        <HistoryTab
          orders={orders}
          items={items}
          onChangeStatus={handleChangeOrderStatus}
        />
      )}
      {activeTab === 'stat' && (
        <BarStatsPage
          orders={orders}
          items={items}
        />
      )}
    </div>
  )
}

function tabBtnStyle(active) {
  return {
    background: active ? '#23243e' : '#1b263b',
    color: '#fff',
    borderRadius: 8,
    border: 'none',
    padding: '8px 18px'
  }
}
function addBtnStyle() {
  return {
    marginBottom: 18,
    background: '#1b263b',
    color: '#fff',
    border: 'none',
    padding: '10px 22px',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 16
  }
}
