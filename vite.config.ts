import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
export default defineConfig({
  plugins: [vue(), ui()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "vue", test: /node_modules\/(?:@vue|vue|vue-router)\// }],
        },
      },
    },
  },
  server: { watch: { usePolling: true } },
});
