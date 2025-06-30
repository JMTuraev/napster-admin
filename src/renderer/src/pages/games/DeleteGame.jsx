import React from 'react'

export default function DeleteGame({ gameId, gameName, onDeleted }) {
  const handleDelete = () => {
    const input = window.prompt(
      `🛑 Siz "${gameName}" o‘yinini o‘chirmoqchisiz.\n\nDavom etish uchun o‘yin nomini aniq kiriting:`
    )

    if (!input || input.trim() !== gameName) {
      alert('❌ O‘yin nomi noto‘g‘ri kiritildi. O‘chirish bekor qilindi.')
      return
    }

    // ✅ Nom to‘g‘ri – o‘chirish
    window.api.socket.emit('delete-game', gameId)
    onDeleted?.()
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
    >
      🗑 O‘chirish
    </button>
  )
}
