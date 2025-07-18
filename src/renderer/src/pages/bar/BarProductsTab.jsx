import React, { useState, useEffect } from 'react'
import ProductCreateForm from './ProductCreateForm'
import ProductEditForm from './ProductEditForm'
import ProductCard from './ProductCard'

const CARD_MIN_WIDTH = 200
const GAP = 20

export default function BarProductsTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editItem, setEditItem] = useState(null) // Edit uchun

  // Mahsulotlarni olish
  const fetchBarItems = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await window.api.invoke('bar-items/get')
      setItems(res || [])
    } catch (e) {
      setError('Сервердан маълумот олишда хато')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBarItems() }, [])

  // Qo'shish
  const handleAdd = async (data) => {
    try {
      await window.api.invoke('bar-items/add', data)
      await fetchBarItems()
    } catch {
      setError('Товарни қўшишда хато')
    }
  }

  // Tahrirlash (edit)
  const handleEdit = (item) => setEditItem(item)

  // Saqlash (update)
  const handleUpdate = async (data) => {
    try {
      await window.api.invoke('bar-items/update', { ...editItem, ...data })
      setEditItem(null)
      await fetchBarItems()
    } catch {
      setError('Товарни янгилашда хато')
    }
  }

  // Bekor qilish (edit)
  const handleCancelEdit = () => setEditItem(null)

  // O'chirish
  const handleDelete = async (id) => {
    try {
      await window.api.invoke('bar-items/delete', id)
      if (editItem && editItem.id === id) setEditItem(null)
      await fetchBarItems()
    } catch {
      setError('Товарни ўчиришда хато')
    }
  }

  // Forma yoki tahrirlash formasi
  const formNode = editItem
    ? <ProductEditForm key="edit" initialData={editItem} onSave={handleUpdate} onCancel={handleCancelEdit} />
    : <ProductCreateForm key="form" onAdd={handleAdd}  existingNames={items.map(i => i.name)}/>

  // Cardlar
  const all = [
    formNode,
    ...items.map(item =>
      <ProductCard
        key={item.id}
        product={item}
        onDelete={() => handleDelete(item.id)}
        onEdit={() => handleEdit(item)}
      />
    )
  ]

  return (
    <div style={{
      width: '100%',
      maxWidth: 1550,
      margin: '0 auto',
      paddingTop: 40,
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
          gap: GAP,
          width: '100%',
          maxHeight: 820,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 32,
        }}
      >
        {all}
      </div>
      {loading && (
        <div style={{
          color: '#8ebfff', fontSize: 19, opacity: 0.8, textAlign: 'center', marginTop: 32
        }}>Загрузка...</div>
      )}
      {error && (
        <div style={{
          color: '#ff6a6a', background: '#2b1818', border: '1.1px solid #d35858',
          borderRadius: 9, fontWeight: 500, padding: '10px 13px', fontSize: 15.5,
          textAlign: 'center', marginTop: 16, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto'
        }}>{error}</div>
      )}
    </div>
  )
}
