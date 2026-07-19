#!/usr/bin/env node
/**
 * Erzeugt einen komplett statisch hostbaren Build in `dist/` für
 * Standard-Webhoster (z. B. serverprofis, Apache/Nginx).
 *
 * Ablauf:
 *   1. Entfernt alte Build-Artefakte und startet Vite direkt über Node.
 *   2. Findet den tatsächlich erzeugten Client-Build (`dist/client`, `.output/public`, …).
 *   3. Lädt – falls vorhanden – den gebauten Server-Handler direkt über Node.
 *   4. Ruft `/` und `/admin` ab; ohne Server-Entry nutzt es den SPA-Fallback.
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
const FINAL_DIST_DIR = "dist";
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

function cleanPreviousBuild() {
  for (const rel of [FINAL_DIST_DIR, ".output"]) {
    fs.rmSync(rel, { recursive: true, force: true });
  }
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
  if (r.error) {
    throw new Error(`Start fehlgeschlagen (${cmd}): ${r.error.message}`);
  }
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

function findServerEntry() {
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "public" || entry.name === "client" || entry.name === "assets") continue;
        walk(p);
      }
      else if (entry.name.endsWith(".mjs") || entry.name.endsWith(".js")) files.push(p);
    }
  }
  for (const dir of [path.join("dist", "server"), path.join(".output", "server")]) walk(dir);

  const preferredNames = ["index.mjs", "index.js", "server.mjs", "server.js", "worker.mjs", "worker.js"];
  for (const name of preferredNames) {
    const match = files.find((file) => path.basename(file) === name);
    if (match) return match;
  }

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("fetch(") && text.includes("export")) return file;
  }

  return null;
}

function findClientBuild() {
  const candidateDirs = [
    path.join("dist", "client"),
    path.join("dist", "public"),
    path.join(".output", "public"),
    "dist",
  ];

  for (const dir of candidateDirs) {
    const indexPath = path.join(dir, "index.html");
    if (fs.existsSync(indexPath)) return { dir, indexPath };
  }

  const found = [];
  function walk(dir, depth = 0) {
    if (!fs.existsSync(dir) || depth > 5) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "server", "assets", "chunks"].includes(entry.name)) continue;
        walk(p, depth + 1);
      } else if (entry.name === "index.html") {
        found.push(p);
      }
    }
  }
  walk("dist");
  walk(".output");

  if (found.length > 0) {
    found.sort((a, b) => scoreClientIndex(b) - scoreClientIndex(a));
    return { dir: path.dirname(found[0]), indexPath: found[0] };
  }

  throw new Error(
    [
      "Client index.html wurde nicht gefunden. Der App-Build hat keinen statischen Client erzeugt.",
      "Gesucht wurde in: dist/client, dist/public, .output/public und dist.",
      "Gefundene Build-Struktur:",
      describeBuildTree(),
    ].join("\n"),
  );
}

function scoreClientIndex(indexPath) {
  const normalized = indexPath.replace(/\\/g, "/");
  if (normalized === "dist/client/index.html") return 100;
  if (normalized === ".output/public/index.html") return 90;
  if (normalized.endsWith("/public/index.html")) return 80;
  if (normalized === "dist/index.html") return 70;
  return 10;
}

function describeBuildTree() {
  const lines = [];
  function walk(dir, prefix = "", depth = 0) {
    if (!fs.existsSync(dir)) {
      lines.push(`${prefix}${dir}/ fehlt`);
      return;
    }
    if (depth > 2) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true }).slice(0, 30);
    for (const entry of entries) {
      lines.push(`${prefix}${entry.name}${entry.isDirectory() ? "/" : ""}`);
      if (entry.isDirectory()) walk(path.join(dir, entry.name), `${prefix}  `, depth + 1);
    }
  }
  for (const dir of ["dist", ".output"]) {
    lines.push(`${dir}/`);
    walk(dir, "  ");
  }
  return lines.join("\n");
}

function readClientIndexHtml(clientBuild) {
  return fs.readFileSync(clientBuild.indexPath, "utf8");
}

async function renderStaticRoute(worker, routePath, clientDir) {
  const response = await worker.fetch(
    new Request(`http://127.0.0.1${routePath}`),
    { ASSETS: createAssetBinding(clientDir) },
    { waitUntil() {}, passThroughOnException() {} },
  );
  if (!response.ok) {
    throw new Error(`Prerender fehlgeschlagen für ${routePath}: HTTP ${response.status}\n${await response.text()}`);
  }
  return response.text();
}

function copyClientBuildToFinalDist(clientDir) {
  const sourceDir = path.resolve(clientDir);
  const finalDir = path.resolve(FINAL_DIST_DIR);

  if (sourceDir === finalDir) {
    for (const rel of ["server", "nitro.json", "package.json", "package-lock.json"]) {
      fs.rmSync(path.join(FINAL_DIST_DIR, rel), { recursive: true, force: true });
    }
    fs.rmSync(".output", { recursive: true, force: true });
    return;
  }

  const tmpDir = path.resolve(`.static-dist-${Date.now()}`);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const src = path.join(sourceDir, entry.name);
    const dest = path.join(tmpDir, entry.name);
    fs.cpSync(src, dest, { recursive: true });
  }

  fs.rmSync(finalDir, { recursive: true, force: true });
  fs.renameSync(tmpDir, finalDir);
  fs.rmSync(".output", { recursive: true, force: true });
}

async function main() {
  console.log("→ 1/6  App-Build");
  cleanPreviousBuild();
  runViteBuild();

  console.log("→ 2/6  Suche Client-Build + Server-Handler");
  const clientBuild = findClientBuild();
  const serverEntryPath = findServerEntry();
  let homeHtml;
  let adminHtml;

  if (serverEntryPath) {
    try {
      const serverEntry = `${pathToFileURL(path.resolve(serverEntryPath)).href}?t=${Date.now()}`;
      const { default: worker } = await import(serverEntry);
      if (!worker || typeof worker.fetch !== "function") throw new Error("Server-Entry exportiert keine fetch-Funktion.");
      console.log(`   Client-Build: ${clientBuild.dir}`);
      console.log(`   Server-Entry: ${serverEntryPath}`);
      console.log("→ 3/6  Prerender / + /admin");
      homeHtml = await renderStaticRoute(worker, "/", clientBuild.dir);
      adminHtml = await renderStaticRoute(worker, "/admin", clientBuild.dir);
    } catch (error) {
      console.warn(`   Server-Prerender übersprungen (${error instanceof Error ? error.message : String(error)}).`);
    }
  }

  if (!homeHtml || !adminHtml) {
    console.log(`   Client-Build: ${clientBuild.dir}`);
    console.log("   Kein nutzbarer Server-Entry gefunden – nutze statischen SPA-Fallback.");
    console.log("→ 3/6  Erzeuge / + /admin aus client/index.html");
    const spaHtml = readClientIndexHtml(clientBuild);
    homeHtml = spaHtml;
    adminHtml = spaHtml;
  }


    console.log("→ 4/6  Lovable-CDN-Assets einbetten");
    const outDir = clientBuild.dir;
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
    copyClientBuildToFinalDist(outDir);

    console.log("\n✅  Statischer Build fertig: dist/ komplett hochladen.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
