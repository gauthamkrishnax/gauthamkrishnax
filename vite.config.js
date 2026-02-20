import { readdirSync } from 'node:fs'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import handlebars from 'vite-plugin-handlebars'	

const __dirname = dirname(fileURLToPath(import.meta.url))

const projectsDir = resolve(__dirname, 'projects')
const projectEntries = Object.fromEntries(
  (readdirSync(projectsDir, { withFileTypes: true }) || [])
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => [
      `projects/${e.name.slice(0, -5)}`,
      resolve(projectsDir, e.name),
    ])
)

export default defineConfig({
  plugins: [
    handlebars({
        partialDirectory: resolve(__dirname, 'src/components'),
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...projectEntries,
      },
    },
  },
})