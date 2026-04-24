import { readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import type { Plugin } from 'vite';

const PAGE_FILE = /^\+Page\.(tsx|mdx|jsx)$/;

function* walkFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}

/** Pathnames (e.g. `/`, `/sermobot`) for every route with a +Page under `src/pages`, excluding `_error`. */
export function discoverPublicPathnames(pagesRoot: string): string[] {
  const pathnames = new Set<string>();
  for (const file of walkFiles(pagesRoot)) {
    if (!PAGE_FILE.test(basename(file))) continue;
    const pathname = pageDirToPathname(dirname(file), pagesRoot);
    if (pathname) pathnames.add(pathname);
  }
  return [...pathnames].sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });
}

function pageDirToPathname(pageDir: string, pagesRoot: string): string | null {
  const rel = relative(pagesRoot, pageDir).replace(/\\/g, '/');
  if (!rel || rel === '.' || rel.startsWith('..')) return null;
  if (rel.split('/').some((s) => s === '_error')) return null;
  const segments = rel.split('/').filter((s) => {
    if (!s) return false;
    if (s[0] === '(' && s.at(-1) === ')') return false;
    return true;
  });
  if (segments.length === 1 && segments[0] === 'index') return '/';
  if (segments.length === 0) return '/';
  return `/${segments.join('/')}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Production deploy: set `PROD=1` in the environment when building the public site. */
export function allowRobotsInThisBuild(): boolean {
  return process.env.PROD === '1';
}

function siteOriginFromEnv(): string {
  const raw = process.env.VITE_SITE_ORIGIN;
  if (typeof raw !== 'string' || raw.trim() === '') return '';
  return raw.trim().replace(/\/$/, '');
}

export function robotsTxtBody(): string {
  if (!allowRobotsInThisBuild()) {
    return 'User-agent: *\nDisallow: /\n';
  }
  const origin = siteOriginFromEnv();
  let body = 'User-agent: *\nAllow: /\n';
  if (origin) body += `\nSitemap: ${origin}/sitemap.xml\n`;
  return body;
}

function absoluteLoc(origin: string, pathname: string): string {
  const suffix = pathname === '/' ? '/' : pathname;
  return `${origin.replace(/\/$/, '')}${suffix}`;
}

/** Sitemap XML, or `null` if `VITE_SITE_ORIGIN` is unset (URLs must be absolute). */
export function sitemapXmlBody(viteRoot: string): string | null {
  const origin = siteOriginFromEnv();
  if (!origin) return null;
  const pagesRoot = join(viteRoot, 'src/pages');
  const pathnames = discoverPublicPathnames(pagesRoot);
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pathnames.map(
    (p) =>
      `  <url>\n    <loc>${escapeXml(absoluteLoc(origin, p))}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/** Emit `robots.txt` / `sitemap.xml` at the static root (`dist/client` in this project) and serve them in dev. */
export function robotsTxtPlugin(): Plugin {
  let viteRoot = process.cwd();
  return {
    name: 'robots-txt-policy',
    configResolved(config) {
      viteRoot = config.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split('?')[0] ?? '';
        if (pathOnly === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(robotsTxtBody());
          return;
        }
        if (pathOnly === '/sitemap.xml') {
          const xml = sitemapXmlBody(viteRoot);
          if (xml === null) {
            res.statusCode = 404;
            res.end();
            return;
          }
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(xml);
          return;
        }
        next();
      });
    },
    writeBundle(options) {
      const dir = options.dir ?? '';
      if (!/[\\/]client$/.test(dir)) return;
      writeFileSync(join(dir, 'robots.txt'), robotsTxtBody(), 'utf8');
      const xml = sitemapXmlBody(viteRoot);
      if (xml !== null) writeFileSync(join(dir, 'sitemap.xml'), xml, 'utf8');
    },
  };
}
