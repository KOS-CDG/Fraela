import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  base: './',
  build: {
    rolldownOptions: {
      input: {
        home: fromRoot('./index.html'),
        archive: fromRoot('./2025/index.html'),
        story: fromRoot('./2026/index.html'),
        creativity: fromRoot('./archive/index.html'),
      },
    },
  },
})
