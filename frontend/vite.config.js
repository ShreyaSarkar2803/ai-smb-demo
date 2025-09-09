import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ["onnxruntime-web"], // Pre-bundle ONNX Runtime dependency for VAD
  },

  build: {
    assetsInlineLimit: 0, // Prevent inlining WASM files; keep as separate assets
  },

  // publicDir defaults to 'public', where VAD ONNX model and WASM files should be placed
  // No need to set explicitly unless customized

  // Optional: set base for asset loading if your app is deployed under a sub-path
  // base: "/",
});
