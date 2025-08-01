import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000,
    proxy: {
      "/api/v1": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@icons": path.resolve(__dirname, "src/assets/icons"),
      "@images": path.resolve(__dirname, "src/assets/images"),
      "@styles": path.resolve(__dirname, "src/assets/styles"),
      "@components": path.resolve(__dirname, "src/components"),
      "@db": path.resolve(__dirname, "src/db"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@hooks": path.resolve(__dirname, "src/common/hooks"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
});
