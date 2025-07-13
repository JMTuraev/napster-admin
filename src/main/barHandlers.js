import { ipcMain } from 'electron'
import {
  getAllBarItems,
  addBarItem,
  updateBarItem,
  deleteBarItem,
  updateBarItemsOrder,
  updateBarItemOrder,
  decreaseRemain,
  increaseRemain,
  clearBarItems
} from '../database/barService.js'

export function registerBarHandlers() {
  ipcMain.handle('bar-items/get', () => getAllBarItems())
  ipcMain.handle('bar-items/add', (e, item) => addBarItem(item))
  ipcMain.handle('bar-items/update', (e, item) => updateBarItem(item))
  ipcMain.handle('bar-items/delete', (e, id) => deleteBarItem(id))
  ipcMain.handle('bar-items/reorder', (e, orderList) => updateBarItemsOrder(orderList))
  ipcMain.handle('bar-items/reorder-one', (e, { id, order_index }) => updateBarItemOrder(id, order_index))
  ipcMain.handle('bar-items/decrease-remain', (e, { id, qty }) => decreaseRemain({ id, qty }))
  ipcMain.handle('bar-items/increase-remain', (e, { id, qty }) => increaseRemain({ id, qty }))
  ipcMain.handle('bar-items/clear', () => clearBarItems())
}
