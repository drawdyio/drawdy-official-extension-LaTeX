import {
  DriverCommandIssuer,
  DriverManifest,
  DriverModule,
  ModuleStyling,
} from "@drawdy/driver-protocol";
import { LATEX_SVG } from "./icon";
import { DEFAULT_FONT_SIZE, META_KEY } from "./consts";
import { DriverToWebview, Equation, WebviewToDriver } from "./types";
import { WEBVIEW_HTML } from "./webview-html";

type EquationMeta = {
  v: 1;
  latex: string;
  display: boolean;
  fontSize: number;
  color: string;
  w: number;
  h: number;
};

let requestId = 0;

let driver: {
  manifest: DriverManifest;
  issueCommand: DriverCommandIssuer;
  generateId: () => string;
  styling: ModuleStyling;
  actionButtonId: string;
  webviewId: string;
} | null = null;

/** The element the panel is currently editing, if any. */
let editingId: string | null = null;

const nextRequestId = (): string => String(requestId++);

function stylingCssVars(styling: ModuleStyling): string {
  return Object.entries(styling)
    .map(([key, value]) =>
      key === "theme"
        ? `color-scheme: ${value};`
        : `--drawdy-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value};`,
    )
    .join("");
}

function post(message: DriverToWebview): void {
  if (!driver) return;
  void driver.issueCommand({
    type: "command:webview:post-message",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: { webviewDomId: driver.webviewId, message },
  });
}

export const activate: DriverModule["activate"] = async ({
  manifest,
  issueCommand,
  styling,
  generateId,
}) => {
  driver = {
    manifest,
    issueCommand,
    generateId,
    styling,
    actionButtonId: `${manifest.driverId}:action-button`,
    webviewId: `${manifest.driverId}:webview`,
  };

  const response = await issueCommand({
    type: "command:dom:create-action-button",
    driverId: manifest.driverId,
    requestId: nextRequestId(),
    req: {
      domElementId: driver.actionButtonId,
      svg: LATEX_SVG,
    },
  });
  if (!response.res.value?.created) {
    return;
  }

  for (const type of [
    "subscription:dom:theme-changed",
    "subscription:scene:drawdy-element-selection",
  ] as const) {
    await issueCommand({
      type,
      driverId: manifest.driverId,
      requestId: nextRequestId(),
    });
  }

  await issueCommand({
    type: "subscription:dom:element-clicked",
    driverId: manifest.driverId,
    requestId: nextRequestId(),
    req: { domElementId: driver.actionButtonId },
  });

  await issueCommand({
    type: "subscription:webview:message",
    driverId: manifest.driverId,
    requestId: nextRequestId(),
    req: { webviewDomId: driver.webviewId },
  });
};

export const onEvent: DriverModule["onEvent"] = async (e) => {
  if (!driver) return;
  switch (e.type) {
    case "subscription:dom:theme-changed": {
      driver.styling = e.body.styling;
      post({
        type: "styling",
        css: stylingCssVars(driver.styling),
        theme: driver.styling.theme,
        color: driver.styling.foreground,
      });
      return;
    }
    case "subscription:dom:element-clicked": {
      if (e.body.domElementId !== driver.actionButtonId) return;
      await driver.issueCommand({
        type: "command:webview:create",
        driverId: driver.manifest.driverId,
        requestId: nextRequestId(),
        req: {
          webviewDomId: driver.webviewId,
          htmlContent: WEBVIEW_HTML.replace(
            "/*__DRAWDY_STYLING__*/",
            stylingCssVars(driver.styling),
          ),
          keepStateWhenClosed: true,
        },
      });
      return;
    }
    case "subscription:scene:drawdy-element-selection": {
      await handleSelection(e.body.drawdyElementIds);
      return;
    }
    case "subscription:webview:message": {
      if (e.body.webviewDomId !== driver.webviewId) return;
      const message = e.body.message;
      if (typeof message !== "object" || message === null) return;
      await handleWebviewMessage(message as WebviewToDriver);
      return;
    }
    default: {
      return;
    }
  }
};

async function handleWebviewMessage(message: WebviewToDriver): Promise<void> {
  switch (message.type) {
    case "ready": {
      if (!driver) return;
      post({
        type: "init",
        theme: driver.styling.theme,
        color: driver.styling.foreground,
      });
      return;
    }
    case "insert": {
      await insertAtViewportCenter(message.equation);
      return;
    }
    case "drop": {
      await dropAt(message.equation, message.x, message.y);
      return;
    }
    case "update": {
      await updateEquation(message.drawdyElementId, message.equation);
      return;
    }
  }
}

function svgSource(svg: string): { blob: Blob } | { url: string } {
  if (typeof Blob === "function") {
    return { blob: new Blob([svg], { type: "image/svg+xml;charset=utf-8" }) };
  }
  return { url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
}

function metaFor(equation: Equation): EquationMeta {
  return {
    v: 1,
    latex: equation.latex,
    display: equation.display,
    fontSize: equation.fontSize,
    color: equation.color,
    w: equation.width,
    h: equation.height,
  };
}

async function addEquation(
  equation: Equation,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<string | null> {
  if (!driver) return null;
  const drawdyElementId = driver.generateId();
  const res = await driver.issueCommand({
    type: "command:scene:add-drawdy-elements",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: {
      elements: [
        {
          type: "image",
          drawdyElementId,
          x,
          y,
          width,
          height,
          meta: { [META_KEY]: metaFor(equation) },
          ...svgSource(equation.svg),
        },
      ],
    },
  });
  return res.res.error === undefined ? drawdyElementId : null;
}

async function insertAt(
  equation: Equation,
  canvasX: number,
  canvasY: number,
): Promise<void> {
  await addEquation(
    equation,
    canvasX - equation.width / 2,
    canvasY - equation.height / 2,
    equation.width,
    equation.height,
  );
}

async function insertAtViewportCenter(equation: Equation): Promise<void> {
  if (!driver) return;
  const res = await driver.issueCommand({
    type: "command:camera:get-viewport-rect",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
  });
  if (!driver || res.res.error !== undefined) return;
  const { rect } = res.res.value;
  await insertAt(equation, rect.x + rect.width / 2, rect.y + rect.height / 2);
}

async function dropAt(
  equation: Equation,
  iframeX: number,
  iframeY: number,
): Promise<void> {
  if (!driver) return;

  const rectRes = await driver.issueCommand({
    type: "command:dom:element-rect",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: { elementId: driver.webviewId },
  });
  if (!driver || rectRes.res.error !== undefined) return;
  const rect = rectRes.res.value;

  const insidePanel =
    iframeX >= 0 &&
    iframeY >= 0 &&
    iframeX <= rect.width &&
    iframeY <= rect.height;
  if (insidePanel) return;

  const canvasRes = await driver.issueCommand({
    type: "command:camera:screen-to-canvas",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: { x: rect.x + iframeX, y: rect.y + iframeY },
  });
  if (!driver || canvasRes.res.error !== undefined) return;
  const { x, y } = canvasRes.res.value;
  await insertAt(equation, x, y);
}

/* ------------------------------------------------------------------ */
/* Editing an equation already on the board                             */
/* ------------------------------------------------------------------ */

function readMeta(meta: unknown): EquationMeta | null {
  if (typeof meta !== "object" || meta === null) return null;
  const stored = (meta as Record<string, unknown>)[META_KEY];
  if (typeof stored !== "object" || stored === null) return null;
  const m = stored as Partial<EquationMeta>;
  if (typeof m.latex !== "string" || m.latex === "") return null;
  return {
    v: 1,
    latex: m.latex,
    display: m.display !== false,
    fontSize:
      typeof m.fontSize === "number" && m.fontSize > 0
        ? m.fontSize
        : DEFAULT_FONT_SIZE,
    color: typeof m.color === "string" && m.color ? m.color : "#111111",
    w: typeof m.w === "number" && m.w > 0 ? m.w : 0,
    h: typeof m.h === "number" && m.h > 0 ? m.h : 0,
  };
}

type StoredEquation = {
  meta: EquationMeta;
  x: number;
  y: number;
  width: number;
  height: number;
};

async function fetchEquation(id: string): Promise<StoredEquation | null> {
  if (!driver) return null;
  const res = await driver.issueCommand({
    type: "command:scene:get-drawdy-elements",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: {
      drawdyElementIds: [id],
      properties: ["meta", "x", "y", "width", "height"],
    },
  });
  if (res.res.error !== undefined) return null;
  const element = res.res.value.drawdyElements.find((el) => el.id === id);
  if (!element) return null;
  const meta = readMeta(element.meta);
  if (!meta) return null;
  return {
    meta,
    x: element.x ?? 0,
    y: element.y ?? 0,
    width: element.width ?? meta.w,
    height: element.height ?? meta.h,
  };
}

/** Offers the panel an edit whenever exactly one of our equations is selected. */
async function handleSelection(ids: string[]): Promise<void> {
  if (ids.length !== 1) {
    if (editingId !== null) {
      editingId = null;
      post({ type: "edit-cleared" });
    }
    return;
  }

  const id = ids[0];
  if (id === editingId) return;

  const stored = await fetchEquation(id);
  if (!stored) {
    if (editingId !== null) {
      editingId = null;
      post({ type: "edit-cleared" });
    }
    return;
  }

  editingId = id;
  post({
    type: "edit",
    drawdyElementId: id,
    latex: stored.meta.latex,
    display: stored.meta.display,
    fontSize: stored.meta.fontSize,
    color: stored.meta.color,
  });
}

async function updateEquation(id: string, equation: Equation): Promise<void> {
  if (!driver) return;

  const stored = await fetchEquation(id);
  if (!stored) {
    editingId = null;
    post({ type: "edit-cleared" });
    await insertAtViewportCenter(equation);
    return;
  }

  const scale =
    stored.meta.w > 0 && stored.width > 0 ? stored.width / stored.meta.w : 1;

  const removed = await driver.issueCommand({
    type: "command:scene:remove-drawdy-elements",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: { drawdyElementIds: [id] },
  });
  if (!driver || removed.res.error !== undefined) return;

  const newId = await addEquation(
    equation,
    stored.x,
    stored.y,
    equation.width * scale,
    equation.height * scale,
  );
  if (!driver || !newId) return;

  await driver.issueCommand({
    type: "command:scene:set-selection",
    driverId: driver.manifest.driverId,
    requestId: nextRequestId(),
    req: { drawdyElementIds: [newId] },
  });
}
