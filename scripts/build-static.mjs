#!/usr/bin/env node
/**
 * Erzeugt einen komplett statisch hostbaren Build in `dist/` für
 * Standard-Webhoster (z. B. serverprofis, Apache/Nginx).
 *
 * Ablauf:
 *   1. `bun run build:app` (regulärer TanStack-Start-Build mit Cloudflare-Preset).
 *   2. Lädt den gebauten Server-Handler direkt über Node.
 *   3. Ruft `/` und `/admin` ab → speichert als statische index.html.
 *   4. Rewrite: alle `/__l5e/assets-v1/...`-Pfade werden zu lokalen
 *      `/assets-cdn/...`-Dateien, die Bilder werden von Lovable-CDN
 *      heruntergeladen und in `dist/assets-cdn/` abgelegt.
 *   5. Legt `.htaccess` für SPA-Fallback + Client-Routing an.
 *   6. Kopiert den fertigen Client-Build nach `dist/`, damit GitHub-/Static-
 *      Hoster direkt den erwarteten `dist/index.html`-Ordner finden.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const LOVABLE_PROJECT_ID = "7691af02-23f9-4aeb-9e86-37387a472ecd";
const LOCAL_ASSET_DIR = "assets-cdn";
const ASSET_HOSTS = [
  process.env.LOVABLE_ASSET_HOST,
  "http://127.0.0.1:8080",
  `https://id-preview--${LOVABLE_PROJECT_ID}.lovable.app`,
  `https://${LOVABLE_PROJECT_ID}.lovableproject.com`,
].filter((host, index, all) => Boolean(host) && all.indexOf(host) === index);

function runViteBuild() {
  const viteBin = path.join("node_modules", "vite", "bin", "vite.js");
  if (!fs.existsSync(viteBin)) {
    throw new Error("Vite wurde nicht gefunden. Bitte zuerst die Dependencies installieren (z. B. npm install).");
  }
  run(process.execPath, [viteBin, "build"]);
}

async function fetchAsset(key) {
  const errors = [];
  for (const host of ASSET_HOSTS) {
    const url = `${host}/__l5e/assets-v1/${key}`;
    try {
      const res = await fetch(url);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      errors.push(`${url} → ${res.status}`);
    } catch (error) {
      errors.push(`${url} → ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`Asset-Download fehlgeschlagen: ${key}\n${errors.join("\n")}`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js" || ext === ".mjs") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".woff2") return "font/woff2";
  if (ext === ".woff") return "font/woff";
  if (ext === ".ttf") return "font/ttf";
  return "application/octet-stream";
}

function createAssetBinding(rootDir) {
  const root = path.resolve(rootDir);
  return {
    async fetch(request) {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname);
      const safePath = path.resolve(path.join(root, `.${pathname}`));
      if (safePath !== root && !safePath.startsWith(`${root}${path.sep}`)) {
        return new Response("Not found", { status: 404 });
      }

      let filePath = safePath;
      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
        const body = await fs.promises.readFile(filePath);
        return new Response(body, { headers: { "content-type": getContentType(filePath) } });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  };
}

async function renderStaticRoute(worker, routePath) {
  const response = await worker.fetch(
    new Request(`http://127.0.0.1${routePath}`),
    { ASSETS: createAssetBinding(path.join("dist", "client")) },
    { waitUntil() {}, passThroughOnException() {} },
  );
  if (!response.ok) {
    throw new Error(`Prerender fehlgeschlagen für ${routePath}: HTTP ${response.status}\n${await response.text()}`);
  }
  return response.text();
}

async function main() {
  console.log("→ 1/6  App-Build");
  runViteBuild();

  console.log("→ 2/6  Lade Server-Handler");
  const serverEntry = `${pathToFileURL(path.resolve("dist", "server", "index.mjs")).href}?t=${Date.now()}`;
  const { default: worker } = await import(serverEntry);

  console.log("→ 3/6  Prerender / + /admin");
  const homeHtml = await renderStaticRoute(worker, "/");
  const adminHtml = await renderStaticRoute(worker, "/admin");


    console.log("→ 4/6  Lovable-CDN-Assets einbetten");
    const outDir = path.join("dist", "client");
    const localAssetsDir = path.join(outDir, LOCAL_ASSET_DIR);
    fs.mkdirSync(localAssetsDir, { recursive: true });

    const walkExt = new Set([".js", ".mjs", ".css", ".html"]);
    const seen = new Set();

    function scan(text) {
      const re = /\/__l5e\/assets-v1\/([A-Za-z0-9._\-\/]+)/g;
      for (const m of text.matchAll(re)) seen.add(m[1]);
    }

    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (walkExt.has(path.extname(entry.name))) {
          const t = fs.readFileSync(p, "utf8");
          if (t.includes("/__l5e/assets-v1/")) scan(t);
        }
      }
    }

    walk(outDir);
    scan(homeHtml);
    scan(adminHtml);

    for (const key of seen) {
      const dest = path.join(localAssetsDir, key);
      if (fs.existsSync(dest)) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      console.log("   ↓", key);
      fs.writeFileSync(dest, await fetchAsset(key));
    }


    // Rewrite in allen relevanten Dateien: /__l5e/assets-v1/ → /assets-cdn/
    function rewriteAll(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) rewriteAll(p);
        else if (walkExt.has(path.extname(entry.name))) {
          const t = fs.readFileSync(p, "utf8");
          if (t.includes("/__l5e/assets-v1/")) {
            fs.writeFileSync(p, t.replaceAll("/__l5e/assets-v1/", `/${LOCAL_ASSET_DIR}/`));
          }
        }
      }
    }
    rewriteAll(outDir);

    const rewrittenHome = homeHtml.replaceAll("/__l5e/assets-v1/", `/${LOCAL_ASSET_DIR}/`);
    const rewrittenAdmin = adminHtml.replaceAll("/__l5e/assets-v1/", `/${LOCAL_ASSET_DIR}/`);

    console.log("→ 5/6  Schreibe index.html + admin/index.html");
    fs.writeFileSync(path.join(outDir, "index.html"), rewrittenHome);
    fs.mkdirSync(path.join(outDir, "admin"), { recursive: true });
    fs.writeFileSync(path.join(outDir, "admin", "index.html"), rewrittenAdmin);

    // .htaccess für Apache-SPA-Fallback + gzip + cache
    const htaccess = `# SPA-Fallback für TanStack-Router (Client-Routing)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # Existierende Dateien/Verzeichnisse direkt ausliefern
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # /admin → statisch vorgerendertes admin/index.html
  RewriteRule ^admin/?$ /admin/index.html [L]
  # Alles andere → index.html (Client-Routing)
  RewriteRule ^ /index.html [L]
</IfModule>

# Kompression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# Cache-Header
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|woff2?|png|jpg|jpeg|webp|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
  # noindex bleibt zusätzlich als Header
  Header set X-Robots-Tag "noindex, nofollow"
</IfModule>
`;
    fs.writeFileSync(path.join(outDir, ".htaccess"), htaccess);

    console.log("→ 6/6  Aufräumen + dist/ für GitHub vorbereiten");
    for (const rel of ["server", "nitro.json", "package.json", "package-lock.json"]) {
      fs.rmSync(path.join("dist", rel), { recursive: true, force: true });
    }

    for (const entry of fs.readdirSync(outDir, { withFileTypes: true })) {
      const src = path.join(outDir, entry.name);
      const dest = path.join("dist", entry.name);
      fs.rmSync(dest, { recursive: true, force: true });
      fs.cpSync(src, dest, { recursive: true });
    }
    fs.rmSync(outDir, { recursive: true, force: true });

    console.log("\n✅  Statischer Build fertig: dist/ komplett hochladen.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
