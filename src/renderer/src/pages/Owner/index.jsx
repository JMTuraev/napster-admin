import React, { useEffect, useState } from 'react'
import OwnerPasswordPanel from './OwnerPasswordPanel'
import BackgroundImageSelector from './BackgroundImageSelector'
import ComputerNumberToggle from './ComputerNumberToggle'
import UpdateUserCard from './UpdateUserCard'
import UpdateAdminCard from './UpdateAdminCard'

export default function Owner() {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    window.api.invoke('get-background-images').then((res) => {
      setImages(res)
      const selectedImage = res.find((img) => img.selected === 1)
      if (selectedImage) setSelected(selectedImage.file_name)
    })
  }, [])

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
  const handleRemove = async (fileName) => {
    await window.api.invoke('delete-background-image', fileName)
    setImages((prev) => prev.filter((i) => i.file_name !== fileName))
    if (selected === fileName) setSelected(null)
  }
  const handleSelect = async (fileName) => {
    const selectedUrl = images.find((i) => i.file_name === fileName)?.url
    setSelected(fileName)
    await window.api.invoke('set-selected-background', { fileName, url: selectedUrl })
  }
  const handleComputerNumberToggle = (status) => {
    window.socket?.emit('set-show-computer-number', status)
  }

  // --- STYLES (faqat bir marta) ---
  useEffect(() => {
    if (!document.head.querySelector('style[data-owner-grid-v2]')) {
      const style = document.createElement('style')
      style.innerHTML = `
        .owner-grid-v2-root::-webkit-scrollbar { width: 9px; background: #181a28; }
        .owner-grid-v2-root::-webkit-scrollbar-thumb { background: #23274D; border-radius: 7px; }
        .owner-grid-v2-card:hover {
          box-shadow: 0 12px 44px 0 #19E5FA44, 0 2px 8px #191D3D44;
          transform: translateY(-3px) scale(1.012);
          z-index: 2;
        }
        @media (max-width: 1200px) {
          .owner-grid-v2-main {
            grid-template-columns: 1fr 2fr 1fr !important;
            gap: 22px !important;
          }
        }
        @media (max-width: 900px) {
          .owner-grid-v2-main {
            grid-template-columns: 1fr !important;
            grid-template-areas:
              "parol"
              "fon"
              "komnata"
              "userupdate"
              "adminupdate";
          }
        }
      `
      style.setAttribute('data-owner-grid-v2', '1')
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div className="owner-grid-v2-root" style={rootStyle}>
      <div className="owner-grid-v2-main" style={gridStyle}>
        {/* 1. Parol */}
        <div className="owner-grid-v2-card" style={{ ...cardStyle, gridArea: "parol" }}>
          <OwnerPasswordPanel />
        </div>
        {/* 2. Fon (O‘rta ustun katta!) */}
        <div className="owner-grid-v2-card" style={{ ...cardStyle, gridArea: "fon" }}>
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
        {/* 3. Komnata */}
        <div className="owner-grid-v2-card" style={{ ...cardStyle, gridArea: "komnata" }}>
          <ComputerNumberToggle onChange={handleComputerNumberToggle} />
        </div>
        {/* 4. User update */}
        <div className="owner-grid-v2-card" style={{ ...cardStyle, gridArea: "userupdate" }}>
          <UpdateUserCard />
        </div>
        {/* 5. Admin update */}
        <div className="owner-grid-v2-card" style={{ ...cardStyle, gridArea: "adminupdate" }}>
          <UpdateAdminCard />
        </div>
      </div>
    </div>
  )
}

// === STYLE OBJECTS ===
const rootStyle = {
  width: '100vw',
  minHeight: '100vh',
  background: 'transparent',
  overflowY: 'auto',
  padding: '0px 32px 44px 32px',
  boxSizing: 'border-box'
}

// --- GRID: 3-column, o‘rta katta, yonlar kichik ---
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '320px 1.6fr 340px', // O‘rta column (fon) ENI katta!
  gridTemplateRows: 'minmax(240px, auto) minmax(190px, auto)',
  gap: '32px',
  gridTemplateAreas: `
    "parol fon userupdate"
    "komnata fon adminupdate"
  `,
  width: '100%',
  maxWidth: '1700px',
  margin: '0 auto'
}

// Har bir card uchun
const cardStyle = {
  background: 'rgba(22,26,48,0.99)',
  borderRadius: 18,
  boxShadow: '0 8px 36px 0 #151D2B66, 0 1.5px 6px #0c172f25',
  padding: '26px 22px 24px 22px',
  minHeight: 205,
  display: 'block',
  width: '100%',
}
