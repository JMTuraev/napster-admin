// src/main/tabsMenuHandler.js
import { ipcMain } from 'electron'
import {
  getAllTabsMenu,
  addTabsMenu,
  updateTabsMenu,
  deleteTabsMenu,
} from '../database/tabsMenuService.js'

export function registerTabsMenuHandlers() {
  ipcMain.handle('tabs-menu/get', () => getAllTabsMenu())
  ipcMain.handle('tabs-menu/add', (event, data) => addTabsMenu(data))
  ipcMain.handle('tabs-menu/update', (event, data) => updateTabsMenu(data))
  ipcMain.handle('tabs-menu/delete', (event, id) => deleteTabsMenu(id))
}
