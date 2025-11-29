// @ts-check

import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://ppbm.no-fluxo.com',
  output: 'static',
  integrations: [svelte(), tailwind(), mdx()],
  server: {
    port: 4321,
    host: true
  },
  vite: {
    preview: {
      allowedHosts: ['ppbm.no-fluxo.com', 'localhost']
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
});

