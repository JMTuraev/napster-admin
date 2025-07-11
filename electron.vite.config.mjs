import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import fs from 'fs-extra'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    input: resolve(__dirname, 'src/preload/index.js'),
    plugins: [
      externalizeDepsPlugin(),
      // Builddan so‘ng utils papkasini out/preload ichiga ko‘chiradi
      {
        name: 'copy-preload-utils',
        writeBundle() {
          // Bu faqat build tugagandan keyin ishlaydi
          const srcDir = resolve(__dirname, 'src/preload/utils')
          const outDir = resolve(__dirname, 'out/preload/utils')
          if (fs.existsSync(srcDir)) {
            fs.copySync(srcDir, outDir)
            // log
            console.log('[vite] src/preload/utils -> out/preload/utils copied')
          }
        }
      }
    ]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    define: {
      global: {}, // socket.io-client uchun kerak
    },
    plugins: [react()],
  },
})
