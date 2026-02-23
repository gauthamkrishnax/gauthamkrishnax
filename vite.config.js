import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import handlebars from 'vite-plugin-handlebars'	

import projectsData from './src/projects/data.js'
import projectsTemplate from './src/projects/template.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectsDir = resolve(__dirname, 'projects')

/**
 * Project Entries
 * @type {Record<string, string>}
 */
const projectEntries = Object.fromEntries(
  (readdirSync(projectsDir, { withFileTypes: true }) || [])
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => [
      `projects/${e.name.slice(0, -5)}`,
      resolve(projectsDir, e.name),
    ])
)

/**
 * Generate Project Pages
 * This plugin generates project pages for each project in the projects directory.
 * It adds the content of each project page from the src/projects/content directory.
 * It also adds the project page to the build input.
 * @returns {import('vite').Plugin}
 */
function generateProjectPages() {
  return {
    name: 'generate-project-pages',
    config(config, { command }) {
      mkdirSync(projectsDir, { recursive: true })
      const input = {
        main: resolve(__dirname, 'index.html'),
      }
      for (const project of projectsData.projects) {
        const html = projectsTemplate(project)
        const filename = `${project.id}.html`
        const filePath = resolve(projectsDir, filename)
        writeFileSync(filePath, html, 'utf-8')
        input[`projects/${project.id}`] = filePath
      }
      // Merge with existing input so main and any other entries are kept
      config.build = config.build || {}
      config.build.rollupOptions = config.build.rollupOptions || {}
      const existing = config.build.rollupOptions.input || {}
      config.build.rollupOptions.input = { ...existing, ...input }
    },
    enforce: 'pre', // run before other plugins if needed
  }
}

export default defineConfig({
  plugins: [
    generateProjectPages(),
    handlebars({
      context: {
        projects: projectsData.projects,
      },
        partialDirectory: [resolve(__dirname, 'src/components'), resolve(__dirname, 'src/projects/content')],
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
        },
      },
    },
  },
})