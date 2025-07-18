import React, { useState, useEffect } from 'react'
import GoodsReceiptForm from './GoodsReceiptForm'
import GoodsReceiptList from './GoodsReceiptList' // import child

export default function GoodsReceiptTab() {
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState([])

  // Mahsulotlarni olish
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

  const handleShowForm = () => setShowForm(true)
  const handleCloseForm = () => setShowForm(false)

  return (
    <div style={{
      margin: '0 auto', width: '100%', maxWidth: 1200,
      minHeight: 600, background: 'rgba(27,28,44,0.7)',
      borderRadius: 16, marginTop: 12, padding: '32px 38px', position: 'relative'
    }}>
      {/* Yangi prixod tugmasi */}
      {!showForm && (
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
      )}

      {/* Form yoki ro‘yxat */}
      {showForm ? (
        <GoodsReceiptForm onClose={handleCloseForm} products={products} />
      ) : (
        <GoodsReceiptList />
      )}
    </div>
  )
}
