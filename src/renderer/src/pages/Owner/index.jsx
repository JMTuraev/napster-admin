import React, { useEffect, useState } from 'react'
import OwnerPasswordPanel from './OwnerPasswordPanel'
import BackgroundImageSelector from './BackgroundImageSelector'

export default function Owner() {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)

  // 📥 DB'dan rasmlarni olish
  useEffect(() => {
    window.api.invoke('get-background-images').then((res) => {
      setImages(res)
      const selectedImage = res.find(img => img.selected === 1)
      if (selectedImage) setSelected(selectedImage.file_name)
    })
  }, [])

  // ➕ Yangi rasm qo‘shish
 const handleAdd = async () => {
  const newImage = await window.api.invoke('select-background-image')
  if (newImage) {
    // Normalizatsiya
    const normalized = {
      file_name: newImage.id, // ← bu `insertBackground`dan keladi
      url: newImage.url
    }
    setImages(prev => [...prev, normalized])
  }
}


  // ❌ Rasmni o‘chirish
  const handleRemove = async (fileName) => {
    await window.api.invoke('delete-background-image', fileName)
    setImages(prev => prev.filter(i => i.file_name !== fileName))
    if (selected === fileName) setSelected(null)
  }

  // ✅ Rasmni tanlash
  const handleSelect = async (fileName) => {
    const selectedUrl = images.find(i => i.file_name === fileName)?.url
    setSelected(fileName)
    await window.api.invoke('set-selected-background', { fileName, url: selectedUrl })
  }

  return (
    <div style={{ display: 'flex' }}>
      <OwnerPasswordPanel />
      <BackgroundImageSelector
        images={images.map((i) => ({
          id: i.file_name,
          url: i.url
        }))}
        onAdd={handleAdd}
        onRemove={handleRemove}
        selectedId={selected}
        onSelect={handleSelect}
      />
    </div>
  )
}
