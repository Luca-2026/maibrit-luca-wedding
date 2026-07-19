#!/usr/bin/env node
/**
 * Erzeugt einen komplett statisch hostbaren Build in `dist/client/` für
 * Standard-Webhoster (z. B. serverprofis, Apache/Nginx).
 *
 * Ablauf:
 *   1. `bun run build` (regulärer TanStack-Start-Build mit Cloudflare-Preset).
 *   2. Startet den gebauten Worker lokal via `wrangler dev`.
 *   3. Ruft `/` und `/admin` ab → speichert als statische index.html.
 *   4. Rewrite: alle `/__l5e/assets-v1/...`-Pfade werden zu lokalen
 *      `/assets-cdn/...`-Dateien, die Bilder werden von Lovable-CDN
 *      heruntergeladen und in `dist/client/assets-cdn/` abgelegt.
 *   5. Legt `.htaccess` für SPA-Fallback + Client-Routing an.
 *   6. Räumt `dist/server/`, `dist/nitro.json`, `dist/package*.json` weg
 *      → nur noch `dist/client/` wird deployed.
 */
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";

const CDN_HOST = "https://cdn.lovable.dev";
const LOCAL_ASSET_DIR = "assets-cdn";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await sleep(300);
  }
  throw new Error(`Server ${url} nicht erreichbar`);
}

async function main() {
  console.log("→ 1/6  Build");
  run("bun", ["run", "build"]);

  console.log("→ 2/6  Starte Wrangler");
  const wr = spawn("bunx", ["wrangler", "dev", "--local", "--port", "8799", "--ip", "127.0.0.1"], {
    cwd: "dist",
    stdio: ["ignore", "pipe", "pipe"],
  });
  wr.stdout.on("data", () => {});
  wr.stderr.on("data", () => {});

  try {
    await waitForServer("http://127.0.0.1:8799/");

    console.log("→ 3/6  Prerender /");
    const homeHtml = await (await fetch("http://127.0.0.1:8799/")).text();
    const adminHtml = await (await fetch("http://127.0.0.1:8799/admin")).text();

    console.log("→ 4/6  Lovable-CDN-Assets einbetten");
    const outDir = path.join("dist", "client");
    const localAssetsDir = path.join(outDir, LOCAL_ASSET_DIR);
    fs.mkdirSync(localAssetsDir, { recursive: true });

    const assetPathRe = /\/__l5e\/assets-v1\/([^"'\s)]+)/g;
    const seen = new Set();

    async function collect(text) {
      let m;
      while ((m = assetPathRe.exec(text))) {
        const key = m[1];
        if (seen.has(key)) continue;
        seen.add(key);
        const url = `${CDN_HOST}/__l5e/assets-v1/${key}`;
        const dest = path.join(localAssetsDir, key);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        console.log("   ↓", key);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`CDN fetch fehlgeschlagen (${res.status}): ${url}`);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
      }
    }

    // Alle relevanten Text-Dateien scannen (HTML + JS-Chunks)
    const walkExt = new Set([".js", ".mjs", ".css", ".html"]);
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (walkExt.has(path.extname(entry.name))) {
          const t = fs.readFileSync(p, "utf8");
          if (t.includes("/__l5e/assets-v1/")) {
            // sync collect via marker; wir sammeln alle Pfade in einem Set und laden dann
            let m;
            while ((m = assetPathRe.exec(t))) seen.add(m[1]);
          }
        }
      }
    }
    walk(outDir);
    await collect(homeHtml);
    await collect(adminHtml);
    // Assets, die wir per walk gesammelt haben, aber noch nicht geladen:
    for (const key of seen) {
      const dest = path.join(localAssetsDir, key);
      if (fs.existsSync(dest)) continue;
      const url = `${CDN_HOST}/__l5e/assets-v1/${key}`;
      console.log("   ↓", key);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CDN fetch fehlgeschlagen (${res.status}): ${url}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
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

    console.log("→ 6/6  Aufräumen (Server-/Nitro-Artefakte)");
    for (const rel of ["server", "nitro.json", "package.json", "package-lock.json"]) {
      fs.rmSync(path.join("dist", rel), { recursive: true, force: true });
    }

    console.log("\n✅  Statischer Build fertig: dist/client/ komplett hochladen.");
  } finally {
    wr.kill("SIGTERM");
    // Notfalls Restprozess killen
    spawnSync("pkill", ["-f", "wrangler dev"], { stdio: "ignore" });
  }
}

main().catch((e) => {
  console.error(e);
  spawnSync("pkill", ["-f", "wrangler dev"], { stdio: "ignore" });
  process.exit(1);
});
