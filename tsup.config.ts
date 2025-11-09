import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "react/index": "src/react/index.tsx",
    "vue/index": "src/vue/index.ts",
    "svelte/index": "src/svelte/index.ts",
    "angular/index": "src/angular/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "vue", "svelte", "@angular/core"],
  esbuildOptions(options, context) {
    // Add 'use client' directive to React bundle only
    if (context.format === "esm" && options.entryPoints?.["react/index"]) {
      options.banner = {
        js: "'use client';",
      };
    }
  },
});
