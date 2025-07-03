// src/main/tabsHandlers.js
import {
  getTabs,
  addTab,
  editTab,
  deleteTab,
  ensureDefaultTabs
} from '../database/tabsService.js'

export function handleTabsEvents(socket, io) {
  // Ilova ishga tushganda DEFAULT tabs larni yaratish uchun:
  ensureDefaultTabs()

  // Tabs ro'yxatini yuborish
  socket.on('get-tabs', () => {
    try {
      const tabs = getTabs()
      socket.emit('tabs', tabs)
      console.log('📤 Tabs ro‘yxati yuborildi')
    } catch (err) {
      console.error('❌ Tabs yuborishda xato:', err.message)
      socket.emit('tabs', [])
    }
  })

  // Yangi tab qo‘shish
  socket.on('add-tab', (name) => {
    try {
      const tabs = addTab(name)
      io.emit('tabs', tabs)
      console.log('✅ Yangi tab qo‘shildi:', name)
    } catch (err) {
      console.error('❌ Tab qo‘shishda xato:', err.message)
      socket.emit('tab-add-result', { status: 'error', message: err.message })
    }
  })

  // Tab nomini tahrirlash
  socket.on('edit-tab', ({ id, name }) => {
    try {
      const tabs = editTab(id, name)
      io.emit('tabs', tabs)
      console.log(`✏️ Tab tahrirlandi: ID=${id} nomi=${name}`)
    } catch (err) {
      console.error('❌ Tab tahrirlashda xato:', err.message)
      socket.emit('tab-edit-result', { status: 'error', message: err.message })
    }
  })

  // Tab o‘chirish (faqat bo‘sh bo‘lsa va default bo‘lmagan)
  socket.on('delete-tab', (id) => {
    try {
      const tabs = deleteTab(id)
      io.emit('tabs', tabs)
      console.log('🗑 Tab o‘chirildi: ID=', id)
    } catch (err) {
      console.error('❌ Tab o‘chirishda xato:', err.message)
      socket.emit('tab-delete-result', { status: 'error', message: err.message })
    }
  })
}
