import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI primitives (Radix)
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-separator",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-switch",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-avatar",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-accordion",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
          ],
          // Canvas / design engine (large)
          "vendor-canvas": ["konva", "react-konva"],
          // PDF generation (large)
          "vendor-pdf": ["jspdf", "jspdf-autotable"],
          // Animation
          "vendor-motion": ["framer-motion"],
          // Backend / auth
          "vendor-supabase": ["@supabase/supabase-js"],
          // Query
          "vendor-query": ["@tanstack/react-query"],
          // Forms
          "vendor-forms": ["react-hook-form", "zod", "@hookform/resolvers"],
        },
      },
    },
  },
});
