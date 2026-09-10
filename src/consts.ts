export const CARET = "‸";

export const META_KEY = "drawdyLatex";

export const DEFAULT_FONT_SIZE = 28;

export const MAX_LATEX_LENGTH = 4000;

export type Snippet = {
  label: string;
  tex: string;
  title: string;
  text?: true;
};
export type SnippetGroup = { id: string; label: string; items: Snippet[] };

const m = (label: string, tex: string, title: string): Snippet => ({
  label,
  tex,
  title,
});

const t = (label: string, tex: string, title: string): Snippet => ({
  label,
  tex,
  title,
  text: true,
});

export const SNIPPET_GROUPS: SnippetGroup[] = [
  {
    id: "structure",
    label: "Structure",
    items: [
      m("\\frac{a}{b}", `\\frac{${CARET}}{}`, "Fraction"),
      m("x^n", `^{${CARET}}`, "Superscript"),
      m("x_n", `_{${CARET}}`, "Subscript"),
      m("\\sqrt{x}", `\\sqrt{${CARET}}`, "Square root"),
      m("\\sqrt[n]{x}", `\\sqrt[${CARET}]{}`, "Nth root"),
      m("(\\,)", `\\left( ${CARET} \\right)`, "Auto-sized parentheses"),
      m("[\\,]", `\\left[ ${CARET} \\right]`, "Auto-sized brackets"),
      m("|x|", `\\left| ${CARET} \\right|`, "Absolute value"),
    ],
  },
  {
    id: "operators",
    label: "Operators",
    items: [
      m("\\pm", "\\pm ", "Plus or minus"),
      m("\\times", "\\times ", "Times"),
      m("\\div", "\\div ", "Divided by"),
      m("\\cdot", "\\cdot ", "Dot product"),
      m("\\le", "\\le ", "Less than or equal"),
      m("\\ge", "\\ge ", "Greater than or equal"),
      m("\\ne", "\\neq ", "Not equal"),
      m("\\approx", "\\approx ", "Approximately equal"),
      m("\\to", "\\to ", "Arrow"),
      m("\\Rightarrow", "\\Rightarrow ", "Implies"),
      m("\\in", "\\in ", "Element of"),
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    items: [
      m("\\int", `\\int_{${CARET}}^{}`, "Integral"),
      m("\\sum", `\\sum_{${CARET}}^{}`, "Sum"),
      m("\\prod", `\\prod_{${CARET}}^{}`, "Product"),
      m("\\lim", `\\lim_{${CARET} \\to }`, "Limit"),
      m("\\frac{d}{dx}", `\\frac{d}{dx} ${CARET}`, "Derivative"),
      m(
        "\\frac{\\partial}{\\partial x}",
        `\\frac{\\partial}{\\partial x} ${CARET}`,
        "Partial derivative",
      ),
      m("\\infty", "\\infty ", "Infinity"),
      m("\\nabla", "\\nabla ", "Nabla"),
    ],
  },
  {
    id: "greek",
    label: "Greek",
    items: [
      m("\\alpha", "\\alpha ", "alpha"),
      m("\\beta", "\\beta ", "beta"),
      m("\\gamma", "\\gamma ", "gamma"),
      m("\\delta", "\\delta ", "delta"),
      m("\\theta", "\\theta ", "theta"),
      m("\\lambda", "\\lambda ", "lambda"),
      m("\\mu", "\\mu ", "mu"),
      m("\\pi", "\\pi ", "pi"),
      m("\\sigma", "\\sigma ", "sigma"),
      m("\\phi", "\\phi ", "phi"),
      m("\\omega", "\\omega ", "omega"),
      m("\\Delta", "\\Delta ", "Delta"),
      m("\\Sigma", "\\Sigma ", "Sigma"),
      m("\\Omega", "\\Omega ", "Omega"),
    ],
  },
  {
    id: "functions",
    label: "Functions",
    items: [
      m("\\sin", "\\sin ", "Sine"),
      m("\\cos", "\\cos ", "Cosine"),
      m("\\tan", "\\tan ", "Tangent"),
      m("\\log", "\\log ", "Logarithm"),
      m("\\ln", "\\ln ", "Natural logarithm"),
      m("\\exp", "\\exp ", "Exponential"),
    ],
  },
  {
    id: "layout",
    label: "Layout",
    items: [
      t(
        "\\begin{cases}",
        `\\begin{cases} ${CARET} & \\text{if } \\\\ & \\text{otherwise} \\end{cases}`,
        "Cases",
      ),
      t(
        "matrix",
        `\\begin{pmatrix} ${CARET} & \\\\ & \\end{pmatrix}`,
        "Matrix",
      ),
      t(
        "aligned",
        `\\begin{aligned} ${CARET} &= \\\\ &= \\end{aligned}`,
        "Aligned lines",
      ),
      t("text", `\\text{${CARET}}`, "Upright text"),
      m("\\vec{v}", `\\vec{${CARET}}`, "Vector"),
      m("\\hat{x}", `\\hat{${CARET}}`, "Hat"),
      m("\\bar{x}", `\\bar{${CARET}}`, "Bar"),
      m("\\dot{x}", `\\dot{${CARET}}`, "Dot"),
    ],
  },
];
