import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ui from '@nuxt/ui/vite';
import { uiTheme, iconBundle } from './lavette-ui.config.ts';

// Fail visibly if a preset attempts to fetch an icon from a remote provider.
const headers = { 'Content-Security-Policy': "connect-src 'self' ws:;" };
export default defineConfig({
  server: { headers },
  preview: { headers },
  plugins: [vue(), ui({
    ui: uiTheme,
    icon: { clientBundle: { icons: iconBundle }, provider: 'none' },
  })],
});
