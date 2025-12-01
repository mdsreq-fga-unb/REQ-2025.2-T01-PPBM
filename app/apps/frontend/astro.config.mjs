// @ts-check

import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://ppbm.no-fluxo.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [svelte(), tailwind(), mdx()],
  server: {
    port: 4321,
    host: true
  }
});

