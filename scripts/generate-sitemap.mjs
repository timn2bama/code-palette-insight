import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE = "https://syncstyle.lovable.app";

// Public routes that should be in sitemap
const routes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/help", priority: "0.8", changefreq: "weekly" },
  { path: "/faq", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/privacy", priority: "0.5", changefreq: "monthly" },
  { path: "/terms", priority: "0.5", changefreq: "monthly" },
  { path: "/sustainability", priority: "0.7", changefreq: "weekly" },
  { path: "/services", priority: "0.7", changefreq: "weekly" },
  { path: "/explore", priority: "0.6", changefreq: "weekly" },
  { path: "/marketplace", priority: "0.7", changefreq: "daily" },
];

const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

const distPath = join(__dirname, "..", "dist", "sitemap.xml");
writeFileSync(distPath, xml, "utf-8");
console.log("✅ Sitemap generated at dist/sitemap.xml");
console.log(`📍 ${routes.length} URLs included`);
