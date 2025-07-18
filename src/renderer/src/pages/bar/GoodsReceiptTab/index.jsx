import React, { useState, useEffect } from 'react'
import GoodsReceiptForm from './GoodsReceiptForm'

export default function GoodsReceiptTab() {
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState([])

  // DBdan mahsulotlar ro‘yxatini olish
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await window.api.invoke('bar-items/get')
        setProducts(
          (res || []).map(item => ({
            id: item.id,
            name: item.name,
            sell_price: item.sell_price,
            remain: item.remain,
            image: item.image
          }))
        )
      } catch (err) {
        setProducts([])
      }
    }
    fetchProducts()
  }, [])

  // Mock prixodlar ro‘yxati (asosiy ro‘yxat)
  const prixods = [
    { id: 1, number: '00012', products: 3, totalQty: 44, totalSum: 340000, date: '2025-07-18' },
    { id: 2, number: '00011', products: 2, totalQty: 20, totalSum: 120000, date: '2025-07-16' }
  ]

  const handleShowForm = () => setShowForm(true)
  const handleCloseForm = () => setShowForm(false)

  return (
    <div style={{
      margin: '0 auto', width: '100%', maxWidth: 1200,
      minHeight: 600, background: 'rgba(27,28,44,0.7)',
      borderRadius: 16, marginTop: 12, padding: '32px 38px', position: 'relative'
    }}>
      {/* Yangi prixod tugmasi */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
        <button
          onClick={handleShowForm}
          style={{
            padding: '10px 34px',
            fontSize: 17, fontWeight: 600,
            background: '#1d67ff',
            color: '#fff', border: 'none',
            borderRadius: 9, cursor: 'pointer',
            boxShadow: '0 2px 12px #1d67ff55'
          }}
        >
          Новый приход
        </button>
      </div>

      {/* Form yoki ro‘yxat */}
      {showForm ? (
        <GoodsReceiptForm onClose={handleCloseForm} products={products} />
      ) : (
        <GoodsReceiptList prixods={prixods} />
      )}
    </div>
  )
}

// Приходlar ro‘yxati (ko‘rinishi, chiroyli dizayn)
function GoodsReceiptList({ prixods }) {
  return (
    <div style={{
      background: '#181926', borderRadius: 10, padding: '24px 34px', minHeight: 300
    }}>
      {prixods.length === 0 ? (
        <div style={{ color: '#b0a9c6', fontSize: 20 }}>Приходлар ҳали йўқ</div>
      ) : (
        prixods.map((p, idx) => (
          <div key={p.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 0', borderBottom: idx !== prixods.length - 1 ? '1px solid #23243a' : 'none',
              fontSize: 18, color: '#e1e6ff', cursor: 'pointer'
            }}>
            <div>№ {p.number}</div>
            <div>Товарлар: <b>{p.products}</b></div>
            <div>Сони: <b>{p.totalQty}</b></div>
            <div>Жами: <b>{p.totalSum.toLocaleString()} сум</b></div>
            <div>{p.date}</div>
            {/* TODO: tafsilot ochish, icon, modal */}
          </div>
        ))
      )}
    </div>
  )
}
