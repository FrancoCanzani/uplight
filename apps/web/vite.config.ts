import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/frontend/routes",
      generatedRouteTree: "./src/frontend/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    cloudflare(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/frontend"),
      "@lib": path.resolve(__dirname, "./src/frontend/lib"),
      "@components": path.resolve(__dirname, "./src/frontend/components"),
      "@features": path.resolve(__dirname, "./src/frontend/features"),
      "@hooks": path.resolve(__dirname, "./src/frontend/hooks"),
      "@routes": path.resolve(__dirname, "./src/frontend/routes"),
      "src": path.resolve(__dirname, "./src"),
    },
  },
});
