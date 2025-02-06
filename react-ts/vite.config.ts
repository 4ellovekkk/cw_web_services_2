import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server:{
    cors: {
      origin: /^https?:\/\/localhost:3000$/, // Allow both HTTP and HTTPS
      credentials: true, // Allow cookies
    }, 
  },
  plugins: [react()],
  resolve:{
    alias:{
      "@":path.resolve(__dirname,"src"),
    },
  },
});
