import React, { useState } from 'react'

export default function BarItemForm({ item, onSave, onCancel }) {
  const [name, setName] = useState(item?.name || '')
  const [price, setPrice] = useState(item?.price || '')
  const [remain, setRemain] = useState(item?.remain || '')
  const [image, setImage] = useState(item?.image || '')
  const [file, setFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.image || '')

  // Fayl tanlanganda
  const handleFileChange = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    // Local preview uchun (imkoniyat bor)
    setImagePreview(URL.createObjectURL(f))

    // Electron: file.path orqali asl fayl manzilini olamiz
    if (window.api?.copyImageFile && f.path) {
      const newPath = await window.api.copyImageFile(f.path)
      if (newPath) {
        setImage(newPath)         // Bazaga yoki yuklashga saqlanadigan path
        setImagePreview(newPath)  // Preview ham public/images/** bo‘ladi
      }
    }
  }

  // Saqlash
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !price || !remain) return
    onSave({
      ...item,
      name,
      price: Number(price),
      remain: Number(remain),
      image,
    })
  }

  // Preview: blob yoki public/images/ path bo‘lishi mumkin
  const previewSrc = imagePreview?.startsWith('blob:') || imagePreview?.startsWith('/images/')
    ? imagePreview
    : ''

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
      background: '#191d2fdd', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#21234a', color: '#fff', borderRadius: 18, padding: 32, minWidth: 320
      }}>
        <h3 style={{ marginBottom: 18 }}>{item ? 'Товар — редактирование' : 'Добавить товар'}</h3>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Название товара"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 15, borderRadius: 6 }}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="number"
            placeholder="Цена"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 15, borderRadius: 6 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="number"
            placeholder="Приход (шт)"
            value={remain}
            onChange={e => setRemain(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 15, borderRadius: 6 }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', padding: 10, fontSize: 15, borderRadius: 6 }}
          />
          {previewSrc && (
            <img src={previewSrc} alt="preview" style={{ marginTop: 10, maxHeight: 80, borderRadius: 6 }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{
            padding: '8px 16px', background: '#23243e', color: '#fff', borderRadius: 6, border: 'none'
          }}>Отмена</button>
          <button type="submit" style={{
            padding: '8px 16px', background: '#6cb5ff', color: '#111', borderRadius: 6, border: 'none', fontWeight: 600
          }}>{item ? 'Сохранить' : 'Добавить'}</button>
        </div>
      </form>
    </div>
  )
}
