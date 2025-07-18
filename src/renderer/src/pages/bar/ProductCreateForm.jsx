import React, { useState, useRef } from 'react'

export default function ProductCreateForm({ onAdd, existingNames }) {
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef()

  // Fayl tanlash va preview
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Faylni base64 qilib olish
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmedName = name.trim()
    // Nomi bo‘sh yoki mavjudmi tekshiramiz
    if (!trimmedName) {
      setError('Товар номи бош бўлмаслиги керак')
      return
    }
    if (existingNames.map(n => n.toLowerCase()).includes(trimmedName.toLowerCase())) {
      setError('Бундай товар аллақачон мавжуд')
      return
    }
    setIsSubmitting(true)
    let imagePath = ''
    try {
      if (imageFile && window.api.copyImageFile) {
        const base64 = await toBase64(imageFile)
        imagePath = await window.api.copyImageFile({
          name: imageFile.name,
          base64,
        })
      }
      await onAdd({ name: trimmedName, image: imagePath })
      setName('')
      setImageFile(null)
      setImagePreview('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      minWidth: 210, minHeight: 260, maxWidth: 230,
      background: 'linear-gradient(145deg,#171b34 80%,#232a4e 120%)',
      borderRadius: 16, boxShadow: '0 4px 14px #0002',
      padding: '18px 13px 14px 13px', margin: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch'
    }}>
      <div style={{
        marginBottom: 12, fontWeight: 700, fontSize: 17, color: '#fff', textAlign: 'center'
      }}>новый вид товара</div>
      <input
        type="text"
        placeholder="название товара"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          width: '100%', padding: 7, fontSize: 14, borderRadius: 6,
          marginBottom: 9, border: '1px solid #29409d', background: '#1a2040', color: '#b8cdfa', fontWeight: 500
        }}
        required
        disabled={isSubmitting}
      />
      <div
        style={{
          border: '1px dashed #3762f5', borderRadius: 8, minHeight: 34, marginBottom: 10, cursor: 'pointer',
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
          disabled={isSubmitting}
        />
        {imagePreview
          ? <img src={imagePreview} alt="preview" style={{
            maxWidth: 60, maxHeight: 34, borderRadius: 5, objectFit: 'cover', background: '#232b56'
          }} />
          : <span style={{ color: '#7ea2e2', fontSize: 13 }}>добавить фото</span>
        }
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%', padding: 9, fontSize: 15, borderRadius: 8, background: 'linear-gradient(90deg,#5ea6ff 5%,#397cff 92%)',
          border: 'none', color: '#fff', fontWeight: 700, marginTop: 6, boxShadow: '0 1px 6px #2456d122',
          letterSpacing: 1, cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.6 : 1
        }}
      >
        {isSubmitting ? 'Пожалуйста, подождите...' : 'СОЗДАТЬ'}
      </button>
      {error && (
        <div style={{
          color: '#ff6a6a',
          fontSize: 13,
          background: '#2b1818',
          border: '1px solid #d35858',
          borderRadius: 7,
          padding: '6px 9px',
          marginTop: 7,
          textAlign: 'center'
        }}>{error}</div>
      )}
    </form>
  )
}
