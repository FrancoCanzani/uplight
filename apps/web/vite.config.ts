import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/frontend"),
      "@lib": path.resolve(__dirname, "./src/frontend/lib"),
      "@components": path.resolve(__dirname, "./src/frontend/components"),
      "@features": path.resolve(__dirname, "./src/frontend/features"),
      "@hooks": path.resolve(__dirname, "./src/frontend/hooks"),
      "@routes": path.resolve(__dirname, "./src/frontend/routes"),
      src: path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
