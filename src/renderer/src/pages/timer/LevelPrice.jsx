import React, { useEffect, useState } from 'react'

export default function LevelPrice() {
  const [levels, setLevels] = useState([])

  useEffect(() => {
    // 🔌 Faqat ishlatilayotgan statuslar (level_id) va ularning narxlarini olish
    window.api
      .invoke('get-used-level-prices')
      .then((data) =>
        setLevels(
          data.map((lvl) => ({
            ...lvl,
            priceInput: lvl.price ?? ''
          }))
        )
      )
      .catch((err) => console.error('❌ Narxlar olinmadi:', err))
  }, [])

  const handlePriceChange = (levelId, newPrice) => {
    setLevels((prev) =>
      prev.map((lvl) =>
        lvl.level_id === levelId ? { ...lvl, priceInput: newPrice } : lvl
      )
    )
  }

  const handleSave = (levelId, inputPrice) => {
    const numericPrice = parseInt(inputPrice)
    if (isNaN(numericPrice)) {
      console.warn('❗ Narx noto‘g‘ri kiritilgan')
      return
    }

    window.api
      .invoke('update-level-price', {
        level_id: levelId,
        price: numericPrice
      })
      .then(() => {
        console.log(`✅ Narx saqlandi: ${numericPrice} (level_id=${levelId})`)
        setLevels((prev) =>
          prev.map((lvl) =>
            lvl.level_id === levelId
              ? { ...lvl, price: numericPrice, priceInput: numericPrice }
              : lvl
          )
        )
      })
      .catch((err) => {
        console.error('❌ Xatolik yuz berdi:', err)
      })
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">💰 Har bir status uchun narx</h2>
      <div className="space-y-3">
        {levels.map((lvl) => (
          <div
            key={lvl.level_id}
            className="flex items-center gap-4 border p-3 rounded"
          >
            <div className="w-32 font-medium">{lvl.name}</div>
            <input
              type="number"
              className="border p-1 w-32"
              value={lvl.priceInput}
              onChange={(e) =>
                handlePriceChange(lvl.level_id, e.target.value)
              }
              placeholder="Narx"
            />
            <button
              onClick={() => handleSave(lvl.level_id, lvl.priceInput)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              💾 Saqlash
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
