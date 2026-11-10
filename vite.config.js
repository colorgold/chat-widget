import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/public-chat-widget.js",
      name: "PublicChatWidget",
      fileName: () => "public-chat-widget.js",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
    },
  },
});
