# vendor/

`tex-svg-full.js` is MathJax 3.2.2's prebuilt `es5/tex-svg-full.js` component,
copied verbatim from the `mathjax` npm package (Apache-2.0).

It is the TeX input jax plus every TeX extension plus the SVG output jax in one
file. The extension inlines it into the webview HTML at build time
(see `rollup.config.mjs`), so:

- **`-full` matters.** The slimmer `tex-svg.js` lazy-loads extensions such as
  `mhchem` from a CDN on first use. The palette has to keep working with no
  network, so everything ships up front.
- **SVG output matters.** It emits `<path>` glyph outlines inside `<defs>`, so a
  rendered equation is a self-contained SVG that needs no font files — exactly
  what can be handed to the board as an image. The HTML output jax would need
  KaTeX-style webfonts that the board renderer cannot load.

To update: `npm pack mathjax@3` and copy `package/es5/tex-svg-full.js` here.
