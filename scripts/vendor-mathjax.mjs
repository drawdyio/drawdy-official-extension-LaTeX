import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "vendor", "tex-svg-full.js");
const target = join(root, "src", "mathjax-source.ts");

const code = readFileSync(source, "utf8");

if (/<\/script/i.test(code)) {
  console.error(`${source} contains "</script" and cannot be inlined`);
  process.exit(1);
}

const banner = [
  "// GENERATED FILE - do not edit by hand.",
  "// Built from vendor/tex-svg-full.js by scripts/vendor-mathjax.mjs.",
  "// Run `pnpm vendor:mathjax` after changing the vendored MathJax bundle.",
  "",
  "/** MathJax 3 `tex-svg-full` component source, inlined into the webview HTML. */",
  "const MATHJAX_SOURCE: string = ",
].join("\n");

writeFileSync(
  target,
  `${banner}${JSON.stringify(code)};\n\nexport default MATHJAX_SOURCE;\n`,
);
console.log(`wrote ${target} (${code.length} chars of MathJax)`);
