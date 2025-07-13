import React, { useEffect, useState, useCallback } from 'react'
import ProductTab from './ProductTab'
import BarItemForm from './BarItemForm'
import OrderList from './OrderList'
import HistoryTab from './HistoryTab'
import BarStatsPage from './BarStatsPage'
import MenuPanel from './MenuPanel'
import OrderDropZone from './OrderDropZone'
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'

// DB bilan ishlash uchun IPC
async function fetchBarItems() {
  return await window.api.invoke('bar-items/get')
}
async function createBarItem(data) {
  return await window.api.invoke('bar-items/add', data)
}
async function updateBarItem(data) {
  return await window.api.invoke('bar-items/update', data)
}
async function deleteBarItem(id) {
  return await window.api.invoke('bar-items/delete', id)
}
async function fetchOrders() {
  return await window.api.invoke('bar-orders/get')
}
async function createOrder(data) {
  return await window.api.invoke('bar-orders/add', data)
}
async function updateOrderStatus({ id, status }) {
  return await window.api.invoke('bar-orders/update-status', { id, status })
}
async function decreaseRemain({ id, qty }) {
  return await window.api.invoke('bar-items/decrease-remain', { id, qty })
}
async function increaseRemain({ id, qty }) {
  return await window.api.invoke('bar-items/increase-remain', { id, qty })
}

// Qoldiqni yangilash helperi
async function updateRemainForOrderStatus(order, prevStatus, newStatus) {
  for (const item of order.items) {
    if (!item.item_id || !item.quantity) continue
    if (prevStatus !== "Оплачен" && newStatus === "Оплачен") {
      await decreaseRemain({ id: item.item_id, qty: item.quantity })
    } else if (prevStatus === "Оплачен" && newStatus !== "Оплачен") {
      await increaseRemain({ id: item.item_id, qty: item.quantity })
    }
  }
}

export default function Bar() {
  const [items, setItems] = useState([])
  const [orders, setOrders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const loadBarItems = useCallback(async () => {
    const res = await fetchBarItems()
    setItems(res || [])
  }, [])

  const loadOrders = useCallback(async () => {
    const res = await fetchOrders()
    setOrders(res || [])
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadBarItems(), loadOrders()]).finally(() => setLoading(false))
  }, [loadBarItems, loadOrders])

  // CRUD faqat productsta (Товары)
  const handleEdit = (item) => { setEditingItem(item); setShowForm(true) }
  const handleDelete = async (id) => { await deleteBarItem(id); await loadBarItems() }
  const handleAdd = () => { setEditingItem(null); setShowForm(true) }
  const handleSave = async (item) => {
    if (item.id) await updateBarItem(item)
    else await createBarItem(item)
    setShowForm(false)
    await loadBarItems()
  }
  const handleCancel = () => setShowForm(false)

  // Status boshqarish (remain update)
  const handleChangeOrderStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const prevStatus = order.status
    if (prevStatus === newStatus) return
    await updateRemainForOrderStatus(order, prevStatus, newStatus)
    await updateOrderStatus({ id: orderId, status: newStatus })
    await loadOrders()
    await loadBarItems()
  }

  // Drag&Drop orqali tez buyurtma
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || over.id !== 'order-drop-zone') return
    const itemId = active.data?.current?.itemId
    if (!itemId) return
    const item = items.find(i => i.id === itemId)
    if (!item || item.remain <= 0) return
    await createOrder({
      item_id: itemId,
      stol: '',
      quantity: 1,
      price: item.price,
      status: 'Не оплачен',
      date: new Date().toLocaleString()
    })
    await loadOrders()
    await loadBarItems()
  }

  // Bulk zakaz
  const handleOrderSubmit = async () => {
    if (!selected.length) return
    const orderItems = selected.map(sel => {
      const item = items.find(i => i.id === sel.itemId)
      return {
        item_id: item.id,
        quantity: sel.quantity,
        price: item.price
      }
    })
    if (!orderItems.length || orderItems.some(i => !i.item_id || !i.quantity)) {
      alert('Kamida 1 ta mahsulot tanlang yoki quantity noto‘g‘ri!')
      return
    }
    const order = {
      stol: '',
      items: orderItems,
      status: 'Не оплачен',
      date: new Date().toLocaleString()
    }
    try {
      await createOrder(order)
      setSelected([])
      await loadOrders()
      await loadBarItems()
    } catch (e) {
      alert("Xatolik: " + (e.message || e))
    }
  }

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 80 }}>Загрузка...</div>

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex', flexDirection: 'row', padding: 0, position: 'relative', minHeight: '100vh'
      }}>
        {/* --- Asosiy kontent --- */}
        <div style={{ flex: 1, padding: 32 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <button onClick={() => setActiveTab('orders')} style={tabBtnStyle(activeTab === 'orders')}>Заказы</button>
            <button onClick={() => setActiveTab('history')} style={tabBtnStyle(activeTab === 'history')}>История</button>
            <button onClick={() => setActiveTab('stat')} style={tabBtnStyle(activeTab === 'stat')}>Статистика</button>
            <button onClick={() => setActiveTab('products')} style={tabBtnStyle(activeTab === 'products')}>Товары</button>
          </div>
          {/* MODAL faqat products tabda */}
          {activeTab === 'products' && showForm && (
            <BarItemForm item={editingItem} onSave={handleSave} onCancel={handleCancel} />
          )}
          {/* TABLAR */}
          {activeTab === 'orders' && (
            <OrderDropZone>
              <OrderList orders={orders} items={items} onChangeStatus={handleChangeOrderStatus} />
            </OrderDropZone>
          )}
          {activeTab === 'history' && (
            <HistoryTab orders={orders} items={items} onChangeStatus={handleChangeOrderStatus} />
          )}
          {activeTab === 'stat' && (
            <BarStatsPage orders={orders} items={items} />
          )}
          {activeTab === 'products' && (
            <ProductTab
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          )}
        </div>
        {/* --- O‘ng menyu panel (zakaz uchun) --- */}
        <MenuPanel
          items={items}
          setItems={setItems}
          selected={selected}
          setSelected={setSelected}
          onOrderSubmit={handleOrderSubmit}
        />
      </div>
    </DndContext>
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
