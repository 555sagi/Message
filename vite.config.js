// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    svgr({
      exportAsDefault: true, // ✅ important line
    }),
    react(),
  ],
<<<<<<< HEAD
  server: {
    allowedHosts: ["gopher-steady-strangely.ngrok-free.app"],
  },
=======
  base:'/',
>>>>>>> 8cc742c (updated-messagge)
});
