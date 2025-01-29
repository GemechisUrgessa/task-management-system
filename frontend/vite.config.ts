import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  //  This is to make sure that the frontend can be accessed from the host machine
  server: { 
    host: '0.0.0.0',
    port: 5173,
  }
})
