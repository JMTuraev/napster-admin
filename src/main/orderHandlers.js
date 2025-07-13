// src/main/orderHandlers.js
import { ipcMain } from 'electron'
import {
  getAllOrders,
  addOrder,
  updateOrderStatus,
} from '../database/orderService.js'

/**
 * Bar buyurtmalari uchun IPC handlerlar.
 * Frontend (React) quyidagicha so‘rov jo‘natadi:
 *   window.api.invoke('bar-orders/get')
 *   window.api.invoke('bar-orders/add', { items: [...], stol, status, date })
 *   window.api.invoke('bar-orders/update-status', { id, status })
 */
export function registerOrderHandlers() {
  // Barcha buyurtmalarni olish
  ipcMain.handle('bar-orders/get', async () => {
    return getAllOrders()
  })

  // Yangi buyurtma (bir nechta mahsulotli chek) qo‘shish
  ipcMain.handle('bar-orders/add', async (event, order) => {
 // order: { stol, items: [{ item_id, quantity, price }, ...], status, date }
  // addOrder ham massiv items uchun tayyorlangan bo‘lishi shart!
  if (!order || !Array.isArray(order.items) || !order.items.length) {
    throw new Error('Buyurtma uchun kamida 1 ta tovar tanlang!')
  }
  return addOrder(order)
  })

  // Buyurtma statusini yangilash
  ipcMain.handle('bar-orders/update-status', async (event, { id, status }) => {
    return updateOrderStatus({ id, status })
  })
}
