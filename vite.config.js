import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      // To enable the os module, you need to explicitly include it
      include: ['os']
    })
  ],
  server:{
    port:3001,
  },
})
