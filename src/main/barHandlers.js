// src/main/barHandlers.js
import { ipcMain } from 'electron'
import {
  getAllBarItems,
  addBarItem,
  updateBarItem,
  deleteBarItem,
} from '../database/barService.js'

export function registerBarHandlers() {
  ipcMain.handle('bar-items/get', () => getAllBarItems())
  ipcMain.handle('bar-items/add', (e, item) => addBarItem(item))
  ipcMain.handle('bar-items/update', (e, item) => updateBarItem(item))
  ipcMain.handle('bar-items/delete', (e, id) => deleteBarItem(id))
}
