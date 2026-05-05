import { defineConfig } from 'astro/config';

export default defineConfig({
  // Default publicDir is 'public/' — assets there are served at site root.
  trailingSlash: 'never',
  build: {
    format: 'file', // emit /about.html instead of /about/index.html
  },
});
