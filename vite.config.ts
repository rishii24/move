// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import { crx } from "@crxjs/vite-plugin"
// import manifest from "./manifest.json"

// // export default defineConfig({
// //   plugins: [react(), crx({ manifest })]
// // })

// export default defineConfig({
//   plugins: [react(),crx({ manifest })]
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  server: {
    strictPort: true,
    port: 5173,
    hmr: {
      clientPort: 5173
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
