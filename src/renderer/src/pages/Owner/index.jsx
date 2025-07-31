import React, { useEffect, useState } from 'react'
import OwnerPasswordPanel from './OwnerPasswordPanel'
import BackgroundImageSelector from './BackgroundImageSelector'
import ComputerNumberToggle from './ComputerNumberToggle'
import UpdateUserCard from './UpdateUserCard' // ✅ Qo‘shamiz

export default function Owner() {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)

  // 📥 Rasmlarni olish
  useEffect(() => {
    window.api.invoke('get-background-images').then((res) => {
      setImages(res)
      const selectedImage = res.find((img) => img.selected === 1)
      if (selectedImage) setSelected(selectedImage.file_name)
    })
  }, [])

  // ➕ Rasm qo‘shish
  const handleAdd = async () => {
    const newImage = await window.api.invoke('select-background-image')
    if (newImage) {
      const normalized = {
        file_name: newImage.id,
        url: newImage.url
      }
      setImages((prev) => [...prev, normalized])
    }
  }

  // ❌ Rasm o‘chirish
  const handleRemove = async (fileName) => {
    await window.api.invoke('delete-background-image', fileName)
    setImages((prev) => prev.filter((i) => i.file_name !== fileName))
    if (selected === fileName) setSelected(null)
  }

  // ✅ Rasm tanlash
  const handleSelect = async (fileName) => {
    const selectedUrl = images.find((i) => i.file_name === fileName)?.url
    setSelected(fileName)
    await window.api.invoke('set-selected-background', { fileName, url: selectedUrl })
  }

  // 🧩 Kompyuter raqami toggle
  const handleComputerNumberToggle = (status) => {
    window.socket?.emit('set-show-computer-number', status)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 12,
      justifyContent: 'flex-start'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'flex-start'
      }}>
        {/* 1. Parol panel */}
        <div style={{ width: 300 }}>
          <OwnerPasswordPanel />
        </div>

        {/* 2. Kompyuter raqami toggle */}
        <div style={{ width: 200 }}>
          <ComputerNumberToggle onChange={handleComputerNumberToggle} />
        </div>

        {/* 3. Rasm tanlovchi */}
        <div style={{ flex: 1, minWidth: 480 }}>
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
      </div>

      {/* === YANGI ROW: User update kartochkasi === */}
      <div>
        <UpdateUserCard />
      </div>
    </div>
  )
}
