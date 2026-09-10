import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

// The webview needs MathJax inline: it is created from a single `htmlContent`
// string, so there is no second file it could <script src> and no network it
// can rely on. Rollup resolves `virtual:mathjax` to the vendored bundle as one
// JSON.stringify'd default export, which escapes the backticks, backslashes and
// `${` that are all over minified code and would otherwise break the template
// literal the HTML is assembled from.
const MATHJAX_ID = "virtual:mathjax";
const MATHJAX_FILE = join(dir, "vendor", "tex-svg-full.js");

const mathjaxSource = () => ({
  name: "mathjax-source",
  resolveId: (id) => (id === MATHJAX_ID ? `\0${MATHJAX_ID}` : null),
  load(id) {
    if (id !== `\0${MATHJAX_ID}`) return null;
    const code = readFileSync(MATHJAX_FILE, "utf8");
    // An inline <script> ends at the first `</script` in the source, whatever
    // it is nested inside. MathJax 3.2.2 happens to contain none, so this only
    // guards a future bundle swap.
    if (/<\/script/i.test(code)) {
      this.error(`${MATHJAX_FILE} contains "</script" and cannot be inlined`);
    }
    this.addWatchFile(MATHJAX_FILE);
    return `export default ${JSON.stringify(code)};`;
  },
});

export default {
  input: join(dir, "src", "index.ts"),
  output: {
    file: join(dir, "dist", "main.js"),
    format: "cjs",
    exports: "named",
  },
  plugins: [
    mathjaxSource(),
    typescript({ tsconfig: join(dir, "tsconfig.json") }),
  ],
};
