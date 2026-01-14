#!/usr/bin/env node
/**
 * Build-time marketing prerender (static HTML snapshots)
 * -----------------------------------------------------
 * Purpose:
 * - Give crawlers real HTML + meta tags for public marketing routes
 * - Keep the interactive app as an SPA under /app and /s/*
 * - Zero feature loss: React routes remain; static snapshots are a progressive enhancement
 *
 * How it works:
 * - Reads src/portals/public/publicContent.json (single source for copy + SEO meta)
 * - Injects HTML into index.html (for '/')
 * - Generates public/<route>/index.html for other marketing routes
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const contentPath = path.join(repoRoot, 'src', 'portals', 'public', 'publicContent.json');
const indexPath = path.join(repoRoot, 'index.html');
const publicDir = path.join(repoRoot, 'public');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderPrerender(page, site) {
  const hero = page?.hero || {};
  const ctas = Array.isArray(hero.ctas) ? hero.ctas : [];
  const sections = Array.isArray(page.sections) ? page.sections : [];

  const ctasHtml = ctas
    .map((c, idx) => {
      const cls = idx === 0 ? 'primary' : 'secondary';
      return `<a class="${cls}" href="${escapeHtml(c.href || '#')}">${escapeHtml(c.label || 'Learn more')}</a>`;
    })
    .join('');

  const sectionsHtml = sections
    .map((s) => {
      const bullets = Array.isArray(s.bullets)
        ? `<ul>${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '';
      const body = s.body ? `<p>${escapeHtml(s.body)}</p>` : '';
      return `<div>
        ${s.title ? `<div style="font-weight:600;font-size:13px;margin-bottom:6px;">${escapeHtml(s.title)}</div>` : ''}
        ${bullets}${body}
      </div>`;
    })
    .join('');

  return `
  <div class="wrap">
    <div class="grid">
      <div>
        <h1>${escapeHtml(hero.heading || site?.tagline || site?.name || 'Breslov Academy')}</h1>
        ${hero.body ? `<p>${escapeHtml(hero.body)}</p>` : ''}
        ${ctasHtml ? `<div class="btns">${ctasHtml}</div>` : ''}
        <div class="small">Storefronts live at <code>/s/&lt;school&gt;</code>. App lives at <code>/app</code>.</div>
      </div>
      <div class="card">
        ${sectionsHtml || `<div style="font-weight:600;">${escapeHtml(site?.name || 'Breslov Academy')}</div>`}
      </div>
    </div>
  </div>
  `.trim();
}

function renderMeta(page, baseUrl, routeKey) {
  const title = page?.title || 'Breslov Academy';
  const desc = page?.description || '';
  const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}${routeKey}` : '';

  const tags = [];
  tags.push(`<title>${escapeHtml(title)}</title>`);
  if (desc) tags.push(`<meta name="description" content="${escapeHtml(desc)}" />`);
  tags.push(`<meta property="og:title" content="${escapeHtml(title)}" />`);
  if (desc) tags.push(`<meta property="og:description" content="${escapeHtml(desc)}" />`);
  tags.push(`<meta property="og:type" content="website" />`);
  if (url) {
    tags.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
  }
  return tags.join('\n    ');
}


function replaceBlock(html, startMarker, endMarker, newContent) {
  const re = new RegExp(`${startMarker}[\s\S]*?${endMarker}`, 'm');
  if (!re.test(html)) return html; // if markers missing, no-op
  return html.replace(re, `${startMarker}
    ${newContent}
    ${endMarker}`);
}

function applyTemplate(htmlTemplate, metaHtml, prerenderHtml) {
  let out = htmlTemplate;
  out = replaceBlock(out, '<!--PUBLIC_META_START-->', '<!--PUBLIC_META_END-->', metaHtml);
  out = replaceBlock(out, '<!--PUBLIC_PRERENDER_START-->', '<!--PUBLIC_PRERENDER_END-->', prerenderHtml);
  return out;
}


function main() {
  if (!fs.existsSync(contentPath)) {
    console.error(`[public-prerender] Missing content file: ${contentPath}`);
    process.exit(1);
  }
  const content = readJson(contentPath);
  const site = content.site || {};
  const routes = content.routes || {};

  const baseUrl =
    process.env.VITE_PUBLIC_BASE_URL ||
    process.env.PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    '';

  const template = fs.readFileSync(indexPath, 'utf-8');

  // 1) Update root index.html prerender/meta (route '/')
  const home = routes['/'];
  if (home) {
    const homeMeta = renderMeta(home, baseUrl, '/');
    const homePre = renderPrerender(home, site);
    const updated = applyTemplate(template, homeMeta, homePre);
    fs.writeFileSync(indexPath, updated, 'utf-8');
  }

  // 2) Generate snapshots for other marketing routes into /public/<route>/index.html
  const marketingRoutes = Object.keys(routes).filter((r) => r !== '/' && !r.startsWith('/login'));
  ensureDir(publicDir);

  for (const r of marketingRoutes) {
    const page = routes[r];
    const meta = renderMeta(page, baseUrl, r);
    const pre = renderPrerender(page, site);
    const html = applyTemplate(template, meta, pre);

    const rel = r.replace(/^\//, ''); // 'pricing'
    const outDir = path.join(publicDir, rel);
    ensureDir(outDir);
    const outFile = path.join(outDir, 'index.html');
    fs.writeFileSync(outFile, html, 'utf-8');
  }

  // 3) Provide a minimal robots.txt during dev; in production, sitemap will be generated at build
  // by vite-plugin-sitemap (dist/sitemap.xml).
  const robotsPath = path.join(publicDir, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    const host = baseUrl ? baseUrl.replace(/\/$/, '') : 'https://example.com';
    fs.writeFileSync(
      robotsPath,
      `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`,
      'utf-8'
    );
  }

  console.log(`[public-prerender] Generated ${marketingRoutes.length} marketing snapshots.`);
}

main();
