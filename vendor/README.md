# vendor/

`tex-svg-full.js` is MathJax 3.2.2's prebuilt `es5/tex-svg-full.js` component,
copied verbatim from the `mathjax` npm package (Apache-2.0).

It is the TeX input jax plus every TeX extension plus the SVG output jax in one
file. The extension inlines it into the webview HTML at build time, so:

- **`-full` matters.** The slimmer `tex-svg.js` lazy-loads extensions such as
  `mhchem` from a CDN on first use. The palette has to keep working with no
  network, so everything ships up front.
- **SVG output matters.** It emits `<path>` glyph outlines inside `<defs>`, so a
  rendered equation is a self-contained SVG that needs no font files — exactly
  what can be handed to the board as an image. The HTML output jax would need
  KaTeX-style webfonts that the board renderer cannot load.

## How it reaches the webview

Drawdy's extension builder compiles `src/` directly and only resolves relative
imports plus `@drawdy/driver-protocol`, so the bundle cannot be pulled in
through a bundler virtual module. Instead `scripts/vendor-mathjax.mjs` copies
this file into `src/mathjax-source.ts` as a single JSON-escaped string with a
default export, and `src/webview-html.ts` imports it like any other module.

`src/mathjax-source.ts` is generated and committed; `pnpm build` regenerates it
automatically (via `prebuild`).

## Updating MathJax

1. `npm pack mathjax@3` and copy `package/es5/tex-svg-full.js` here.
2. Run `pnpm vendor:mathjax` to regenerate `src/mathjax-source.ts`.
3. Commit both files.
