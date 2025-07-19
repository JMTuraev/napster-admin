// src/main/ordersHandler.js

import { ipcMain } from 'electron'
import { createOrder, updateOrderStatus, listOrders } from '../database/orderService' // path to‘g‘ri bo‘lishi kerak!

export function registerOrdersHandlers() {
  // Avval tozalaymiz, so‘ng ro‘yxatdan o‘tkazamiz (restartlarsiz qayta ishlaydi)
  ipcMain.removeHandler('orders/list')
  ipcMain.removeHandler('orders/create')
  ipcMain.removeHandler('orders/update-status')

  // Buyurtmalar ro‘yxatini olish
  ipcMain.handle('orders/list', async () => {
    try {
      const orders = await listOrders()
      return { success: true, orders }
    } catch (e) {
      return { success: false, error: e.message, orders: [] }
    }
  })

  // Yangi buyurtma
  ipcMain.handle('orders/create', async (event, order) => {
    try {
      const orderId = await createOrder(order)
      return { success: true, orderId }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })

  // Status yangilash
  ipcMain.handle('orders/update-status', async (event, { orderId, status }) => {
    try {
      await updateOrderStatus(orderId, status)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  })
}
