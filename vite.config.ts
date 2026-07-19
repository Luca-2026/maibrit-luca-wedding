// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { createLogger } from "vite";

const logger = createLogger();
const warn = logger.warn;
logger.warn = (message, options) => {
  const text = typeof message === "string" ? message : String(message);
  if (
    text.includes('The plugin "vite-tsconfig-paths" is detected') ||
    text.includes("Some chunks are larger than 500 kB") ||
    text.includes("inlineDynamicImports option is ignored")
  ) {
    return;
  }
  warn(message, options);
};

export default defineConfig({
  nitro: {
    preset: "cloudflare-module",
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
  vite: {
    customLogger: logger,
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
});
