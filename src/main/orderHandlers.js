// src/main/orderHandlers.js
import { ipcMain } from 'electron'
import {
  getAllOrders,
  addOrder,
  updateOrderStatus,
} from '../database/orderService.js'

export function registerOrderHandlers() {
  ipcMain.handle('bar-orders/get', () => getAllOrders())
  ipcMain.handle('bar-orders/add', (e, order) => addOrder(order))
  ipcMain.handle('bar-orders/update-status', (e, data) => updateOrderStatus(data))
}
