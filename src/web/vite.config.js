import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.REFUGE_API_ORIGIN || "http://127.0.0.1:5000",
        changeOrigin: false,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
