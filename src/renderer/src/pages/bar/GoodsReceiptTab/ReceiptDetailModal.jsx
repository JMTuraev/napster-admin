import React, { useState, useEffect } from 'react'

// --- Format funksiyalari
function numberWithSpaces(x) {
  if (!x && x !== 0) return ''
  let s = x.toString().replace(/\D/g, '')
  if (!s) return '0'
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString('uz-UZ')
}
function formatTime(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

export default function ReceiptDetailModal({ receipt, onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editIdx, setEditIdx] = useState(null)
  const [editVals, setEditVals] = useState({ qty: '', buy_price: '' })
  const [saving, setSaving] = useState(false)

  // Modal uchun reset
  const resetEdit = () => {
    setEditIdx(null)
    setEditVals({ qty: '', buy_price: '' })
  }

  // Tafsilotlarni olish
  useEffect(() => {
    let cancelled = false
    async function fetchItems() {
      setLoading(true)
      try {
        const res = await window.api.invoke('goods-receipt/items', receipt.id)
        if (!cancelled) setItems(res || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (receipt && receipt.id) fetchItems()
    return () => { cancelled = true }
  }, [receipt])

  // Edit ochish
  const handleEdit = (idx) => {
    const item = items[idx]
    setEditIdx(idx)
    setEditVals({
      qty: item.qty || '',
      buy_price: item.buy_price || ''
    })
  }

  // Edit saqlash
  const handleSaveEdit = async () => {
    const item = items[editIdx]
    setSaving(true)
    try {
      await window.api.invoke('goods-receipt/item/update', {
        id: item.id,
        qty: Number(editVals.qty),
        buy_price: Number(editVals.buy_price)
      })
      // Frontda yangilash
      const newItems = items.map((itm, idx) =>
        idx === editIdx
          ? { ...itm, qty: Number(editVals.qty), buy_price: Number(editVals.buy_price) }
          : itm
      )
      setItems(newItems)
      resetEdit()
    } finally {
      setSaving(false)
    }
  }

  // Delete qilish
  const handleDelete = async (idx) => {
    const item = items[idx]
    if (!window.confirm(`Rostdan ham "${item.name}"ni o‘chirmoqchimisiz?`)) return
    await window.api.invoke('goods-receipt/item/delete', item.id)
    setItems(items.filter((_, i) => i !== idx))
    resetEdit()
  }

  if (!receipt || !receipt.id) return null

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(22,24,44,0.73)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        minWidth: 420, maxWidth: 600, background: '#181926', borderRadius: 13, boxShadow: '0 2px 30px #22233c88',
        padding: 32, position: 'relative'
      }}>
        <button
          style={{
            position: 'absolute', top: 12, right: 18, fontSize: 23, border: 'none', background: 'none', color: '#fff8bb', cursor: 'pointer'
          }}
          onClick={onClose}
          title="Yopish"
        >×</button>
        <div style={{ fontSize: 21, fontWeight: 600, color: '#68d5ff', marginBottom: 10 }}>
          Приход № {receipt.number || receipt.id}
        </div>
        <div style={{ color: '#aaa', fontSize: 15, marginBottom: 15 }}>
          {receipt.created_at
            ? (
              <span>
                {formatDate(receipt.created_at)}
                <span style={{ color: '#93b6e1', marginLeft: 7 }}>
                  {formatTime(receipt.created_at)}
                </span>
              </span>
            )
            : receipt.date || ''}
        </div>
        {loading ? (
          <div style={{ color: '#b0a9c6', fontSize: 16 }}>Yuklanmoqda...</div>
        ) : (
          <>
            {(!items || !items.length) ? (
              <div style={{ color: '#b0a9c6', fontSize: 16 }}>Тафсилотлар йўқ</div>
            ) : (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1.5fr 0.9fr 1fr 1fr 52px',
                  gap: 6,
                  fontWeight: 600, color: '#81e1c2', fontSize: 15, marginBottom: 5
                }}>
                  <div>№</div>
                  <div>Товар</div>
                  <div>Сони</div>
                  <div>Нархи</div>
                  <div>Жами</div>
                  <div></div>
                </div>
                {items.map((item, idx) => (
                  <div key={item.id || idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1.5fr 0.9fr 1fr 1fr 52px',
                    gap: 6, alignItems: 'center', fontSize: 15, color: '#e4ebff',
                    background: idx % 2 ? 'rgba(66,78,97,0.12)' : 'none', borderRadius: 5, marginBottom: 1
                  }}>
                    <div style={{ textAlign: 'center' }}>{idx + 1}</div>
                    <div>
                      {item.image && (
                        <img src={item.image} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, marginRight: 7, verticalAlign: 'middle' }} />
                      )}
                      {item.name}
                    </div>
                    <div>{numberWithSpaces(item.qty)}</div>
                    <div>{numberWithSpaces(item.buy_price)} сум</div>
                    <div>{numberWithSpaces(item.qty * item.buy_price)} сум</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button title="Tahrirlash"
                        onClick={() => handleEdit(idx)}
                        style={{
                          border: 'none', background: 'none', color: '#7ee3fb', fontSize: 18, cursor: 'pointer'
                        }}>✎</button>
                      <button title="O‘chirish"
                        onClick={() => handleDelete(idx)}
                        style={{
                          border: 'none', background: 'none', color: '#ffbaba', fontSize: 19, cursor: 'pointer'
                        }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {editIdx !== null && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(22,24,44,0.54)', zIndex: 1010,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              minWidth: 320, background: '#202231', borderRadius: 10, boxShadow: '0 2px 20px #22233c88',
              padding: 24, position: 'relative'
            }}>
              <button
                style={{
                  position: 'absolute', top: 11, right: 16, fontSize: 21, border: 'none', background: 'none', color: '#fff8bb', cursor: 'pointer'
                }}
                onClick={resetEdit}
                title="Yopish"
              >×</button>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#7ee3fb', marginBottom: 13 }}>
                Товарни тahrirlash
              </div>
              <label style={{ display: 'block', color: '#81e1c2', marginBottom: 7, fontSize: 15 }}>
                Soni:
                <input type="number"
                  value={editVals.qty}
                  onChange={e => setEditVals(v => ({ ...v, qty: e.target.value }))}
                  style={{ width: '100%', marginTop: 3, padding: '5px 10px', borderRadius: 6, border: '1px solid #23244a', fontSize: 15, marginBottom: 11, background: '#222339', color: '#e3f7ff' }}
                />
              </label>
              <label style={{ display: 'block', color: '#81e1c2', marginBottom: 7, fontSize: 15 }}>
                Narxi:
                <input type="number"
                  value={editVals.buy_price}
                  onChange={e => setEditVals(v => ({ ...v, buy_price: e.target.value }))}
                  style={{ width: '100%', marginTop: 3, padding: '5px 10px', borderRadius: 6, border: '1px solid #23244a', fontSize: 15, marginBottom: 17, background: '#222339', color: '#e3f7ff' }}
                />
              </label>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 6, border: 'none', background: '#1ecdc1', color: '#1b202c',
                  fontSize: 16, fontWeight: 600, marginTop: 4, cursor: 'pointer', opacity: saving ? 0.6 : 1
                }}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
