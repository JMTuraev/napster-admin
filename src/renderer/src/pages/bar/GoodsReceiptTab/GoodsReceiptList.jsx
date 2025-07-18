import React, { useEffect, useState } from 'react'

// number format
function numberWithSpaces(x) {
  if (!x) return ''
  let s = x.toString().replace(/\D/g, '')
  if (!s) return ''
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function GoodsReceiptList() {
  const [prixods, setPrixods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchPrixods() {
      setLoading(true)
      setError('')
      try {
        const res = await window.api.invoke('goods-receipt/list')
        console.log(res)
        if (!cancelled) setPrixods(res || [])
      } catch (err) {
        if (!cancelled) setError('Maʼlumotlarni yuklab boʻlmadi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPrixods()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{
      background: '#181926', borderRadius: 10, padding: '24px 34px', minHeight: 300, width: '100%'
    }}>
      {loading ? (
        <div style={{ color: '#b0a9c6', fontSize: 18 }}>Yuklanmoqda...</div>
      ) : error ? (
        <div style={{ color: '#f66', fontSize: 18 }}>{error}</div>
      ) : prixods.length === 0 ? (
        <div style={{ color: '#b0a9c6', fontSize: 20 }}>Приходлар ҳали йўқ</div>
      ) : (
        prixods.map((p, idx) => (
          <div key={p.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 0', borderBottom: idx !== prixods.length - 1 ? '1px solid #23243a' : 'none',
              fontSize: 32, color: '#e1e6ff', gap: 10
            }}>
            <div style={{ fontWeight: 500, minWidth: 180 }}>№ {p.number}</div>
            <div>Товарлар: <b>{p.products}</b></div>
            <div>Сони: <b>{numberWithSpaces(p.totalQty)}</b></div>
            <div>Жами: <b>{numberWithSpaces(p.totalSum)} сум</b></div>
            <div style={{ fontWeight: 400 }}>{p.date}</div>
          </div>
        ))
      )}
    </div>
  )
}
