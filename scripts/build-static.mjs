#!/usr/bin/env node
/**
 * Erzeugt einen komplett statisch hostbaren Build in `dist/` für
 * Standard-Webhoster (z. B. serverprofis, Apache/Nginx).
 *
 * Ablauf:
 *   1. `bun run build:app` (regulärer TanStack-Start-Build mit Cloudflare-Preset).
 *   2. Startet den gebauten Worker lokal via `wrangler dev`.
 *   3. Ruft `/` und `/admin` ab → speichert als statische index.html.
 *   4. Rewrite: alle `/__l5e/assets-v1/...`-Pfade werden zu lokalen
 *      `/assets-cdn/...`-Dateien, die Bilder werden von Lovable-CDN
 *      heruntergeladen und in `dist/assets-cdn/` abgelegt.
 *   5. Legt `.htaccess` für SPA-Fallback + Client-Routing an.
 *   6. Kopiert den fertigen Client-Build nach `dist/`, damit GitHub-/Static-
 *      Hoster direkt den erwarteten `dist/index.html`-Ordner finden.
 */
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";

const LOVABLE_PROJECT_ID = "7691af02-23f9-4aeb-9e86-37387a472ecd";
const LOCAL_ASSET_DIR = "assets-cdn";
const ASSET_HOSTS = [
  process.env.LOVABLE_ASSET_HOST,
  "http://127.0.0.1:8080",
  `https://id-preview--${LOVABLE_PROJECT_ID}.lovable.app`,
  `https://${LOVABLE_PROJECT_ID}.lovableproject.com`,
].filter((host, index, all) => Boolean(host) && all.indexOf(host) === index);

function commandExists(cmd) {
  return spawnSync(cmd, ["--version"], { stdio: "ignore" }).status === 0;
}

function runScript(scriptName) {
  const userAgent = process.env.npm_config_user_agent ?? "";
  if (userAgent.startsWith("bun") || (!userAgent && commandExists("bun"))) {
    run("bun", ["run", scriptName]);
    return;
  }
  if (userAgent.startsWith("pnpm")) {
    run("pnpm", ["run", scriptName]);
    return;
  }
  if (userAgent.startsWith("yarn")) {
    run("yarn", [scriptName]);
    return;
  }
  run("npm", ["run", scriptName]);
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
  console.log("→ 1/6  App-Build");
  runScript("build:app");

  console.log("→ 2/6  Starte Wrangler");
  const wrangler = commandExists("bunx")
    ? { cmd: "bunx", args: ["wrangler"] }
    : { cmd: "npx", args: ["--yes", "wrangler"] };
  const wr = spawn(wrangler.cmd, [...wrangler.args, "dev", "--local", "--port", "8799", "--ip", "127.0.0.1"], {
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

    // Wrangler nicht mehr gebraucht – beenden, damit dist/client nicht mehr geöffnet ist
    wr.kill("SIGTERM");
    spawnSync("pkill", ["-f", "wrangler dev"], { stdio: "ignore" });
    await sleep(500);


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
