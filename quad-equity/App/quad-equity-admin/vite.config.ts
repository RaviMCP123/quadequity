import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: [
      { find: /^interface\/(.+)$/, replacement: `${path.resolve(__dirname, "src/interface")}/$1` },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
      { find: "@pages", replacement: path.resolve(__dirname, "src/pages") },
      { find: "@reducers", replacement: path.resolve(__dirname, "src/reducers") },
      { find: "@utils", replacement: path.resolve(__dirname, "src/utils") },
      { find: "@services", replacement: path.resolve(__dirname, "src/services") },
      { find: "@config", replacement: path.resolve(__dirname, "src/config") },
      { find: "store", replacement: path.resolve(__dirname, "src/store/index.ts") },
    ],
  },
  server: {
    port: 5174,
  },
});
