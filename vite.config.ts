import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Kubikk – MC-turplanlegger",
        short_name: "Kubikk",
        description: "Planlegg svingete MC-turer i Norge og eksporter til Google Maps, Apple Maps eller GPX.",
        theme_color: "#f97316",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        // Placeholder-ikon (SVG). Bytt ut med ekte 192/512px PNG-ikoner før
        // produksjon for best kompatibilitet med iOS "Legg til på Hjem-skjerm".
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
      workbox: {
        // App-skall + API-svar caches. Kartfliser (CARTO/OSM) caches bevisst IKKE
        // proaktivt her – bulk/offline-nedlasting av fliser er ikke tillatt hos
        // disse gratis-leverandørene. Kartet krever nett; lagrede ruter og UI
        // fungerer offline.
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/(route|weather)/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 },
              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
    }),
  ],
});
