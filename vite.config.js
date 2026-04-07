import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import handlebars from 'vite-plugin-handlebars'	

import projectsData from './src/projects/data.js'
import projectsTemplate from './src/projects/template.js'

const publishedProjects = projectsData.projects.filter((p) => p.publish === true)

/** Set in production for absolute canonical & Open Graph URLs (no trailing slash). */
const siteOrigin = (process.env.VITE_SITE_ORIGIN || "").replace(/\/$/, "")
const defaultOgImage = siteOrigin
  ? `${siteOrigin}/og-default.png`
  : "/og-default.png"

/** Non-empty `PROD` env → crawlers allowed; missing/empty → robots.txt Disallow: / (staging, local, preview). */
const allowCrawl = String(process.env.PROD || "").trim() !== ""

function robotsTxt() {
  if (!allowCrawl) {
    return "User-agent: *\nDisallow: /\n"
  }
  let body = "User-agent: *\nAllow: /\n"
  if (siteOrigin) {
    body += `\nSitemap: ${siteOrigin}/sitemap.xml\n`
  }
  return body
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
}

function sitemapXml() {
  const urls = [
    `${siteOrigin}/`,
    ...publishedProjects.map((p) => `${siteOrigin}/projects/${p.id}`),
  ]
  const lines = urls.map(
    (loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join("\n")}
</urlset>
`
}

/**
 * Writes robots.txt / sitemap.xml to dist and serves them in dev (same rules as build).
 * @returns {import('vite').Plugin}
 */
function seoFiles() {
  let outDir = "dist"
  return {
    name: "seo-files",
    configResolved(config) {
      outDir = config.build.outDir
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? ""
        if (pathname === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8")
          res.end(robotsTxt())
          return
        }
        if (pathname === "/sitemap.xml") {
          if (!allowCrawl || !siteOrigin) {
            res.statusCode = 404
            res.end()
            return
          }
          res.setHeader("Content-Type", "application/xml; charset=utf-8")
          res.end(sitemapXml())
          return
        }
        next()
      })
    },
    closeBundle() {
      const dir = resolve(__dirname, outDir)
      mkdirSync(dir, { recursive: true })
      writeFileSync(resolve(dir, "robots.txt"), robotsTxt(), "utf-8")
      if (allowCrawl && siteOrigin) {
        writeFileSync(resolve(dir, "sitemap.xml"), sitemapXml(), "utf-8")
      }
    },
  }
}

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
      for (const project of publishedProjects) {
        const html = projectsTemplate(project, { siteOrigin })
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
    seoFiles(),
    handlebars({
      context: {
        projects: publishedProjects,
        siteOrigin,
        ogImage: defaultOgImage,
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