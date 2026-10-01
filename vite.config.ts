import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import { allPreviewIcons } from "./src/icons.ts";
export default defineConfig({
  plugins: [vue(), ui({ icon: { clientBundle: { icons: allPreviewIcons } } })],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vue", test: /node_modules\/(?:@vue|vue|vue-router)\// },
            { name: "color", test: /node_modules\/culori\// },
          ],
        },
      },
    },
  },
  server: { watch: { usePolling: true } },
});
