import { ipcMain } from 'electron'
import {
  getPcNumberUiSettings,
  updatePcNumberUiSettings
} from '../database/pcNumberUiService.js'

export function registerPcNumberUiHandlers() {
  ipcMain.handle('get-pc-number-ui-settings', () => {
    return getPcNumberUiSettings()
  })

  ipcMain.handle('update-pc-number-ui-settings', (event, { show_number, font_size }) => {
    updatePcNumberUiSettings(show_number, font_size)
    return { success: true }
  })
}
