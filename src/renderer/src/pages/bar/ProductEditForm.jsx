import React, { useState, useRef, useEffect } from 'react'

export default function ProductEditForm({ initialData, onSave, onCancel }) {
  const [name, setName] = useState(initialData?.name || '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image || '')
  const fileInputRef = useRef()

  useEffect(() => {
    setName(initialData?.name || '')
    setImagePreview(initialData?.image || '')
  }, [initialData])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let imagePath = imagePreview
    if (imageFile && window.api.copyImageFile && imageFile.path) {
      imagePath = await window.api.copyImageFile(imageFile.path)
    }
    onSave({ name: name.trim(), image: imagePath })
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit} style={{
      minWidth: 210, minHeight: 260, maxWidth: 230,
      background: 'linear-gradient(145deg,#17203a 80%,#232a4e 120%)',
      borderRadius: 16, boxShadow: '0 4px 14px #0002',
      padding: '18px 13px 14px 13px', margin: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch'
    }}>
      <div style={{
        marginBottom: 11, fontWeight: 700, fontSize: 18, color: '#85b7f7', textAlign: 'center'
      }}>ИЗМЕНИТЬ ТОВАР</div>
      <input
        type="text"
        placeholder="название товара"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          width: '100%', padding: 9, fontSize: 15, borderRadius: 6, marginBottom: 13,
          border: '1.2px solid #29409d', background: '#1a2040', color: '#b8cdfa', fontWeight: 600
        }}
        required
      />
      <div
        style={{
          border: '1.2px dashed #3762f5', borderRadius: 8, minHeight: 40, marginBottom: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#232b56'
        }}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {imagePreview
          ? <img src={imagePreview} alt="preview" style={{
            maxWidth: 80, maxHeight: 40, borderRadius: 5, objectFit: 'cover', background: '#232b56'
          }} />
          : <span style={{ color: '#7ea2e2', fontSize: 15 }}>добавить фото</span>
        }
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 7 }}>
        <button type="submit" style={{
          flex: 1,
          padding: 8, fontSize: 15, borderRadius: 7,
          background: 'linear-gradient(90deg,#5ea6ff 5%,#397cff 92%)',
          border: 'none', color: '#fff', fontWeight: 700,
          cursor: 'pointer'
        }}>
          СОХРАНИТЬ
        </button>
        <button type="button" onClick={onCancel} style={{
          flex: 1, background: '#202433', border: '1.2px solid #496f9a', color: '#8ea4d7', fontWeight: 700,
          borderRadius: 7, fontSize: 15, cursor: 'pointer'
        }}>
          ОТМЕНА
        </button>
      </div>
    </form>
  )
}
