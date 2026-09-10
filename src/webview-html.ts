import MATHJAX_SRC from "./mathjax-source";
import {
  CARET,
  DEFAULT_FONT_SIZE,
  MAX_LATEX_LENGTH,
  SNIPPET_GROUPS,
} from "./consts";

const CONFIG = JSON.stringify({
  groups: SNIPPET_GROUPS,
  caret: CARET,
  defaultFontSize: DEFAULT_FONT_SIZE,
  maxLength: MAX_LATEX_LENGTH,
});

const BODY = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style id="styling">:root{/*__DRAWDY_STYLING__*/}</style>
<style>
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    font-size: 12px;
    background: var(--drawdy-background, #fff);
    color: var(--drawdy-foreground, #111);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}
[hidden] { display: none !important; }
button { font: inherit; cursor: pointer; }

/* ---- shell: the palette scrolls, the editor below it stays put -------- */
main { flex: 1; min-height: 0; overflow-y: auto; padding: 12px 12px 10px; }
#editor {
    flex: none;
    padding: 0 12px 10px;
    border-top: 1px solid var(--drawdy-border, #e5e5e5);
    background: var(--drawdy-background, #fff);
}

/* ---- symbol palette: labelled groups, typeset keys -------------------- */
.group + .group { margin-top: 8px; }
.group-label {
    margin: 0 0 4px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--drawdy-muted-foreground, #888);
}
.keys { display: flex; flex-wrap: wrap; gap: 3px; }
.key {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 7px;
    font-size: 13px;
    line-height: 1;
    border: 1px solid var(--drawdy-border, #e5e5e5);
    border-radius: 6px;
    background: var(--drawdy-surface, #f4f4f4);
    color: var(--drawdy-foreground, #111);
    white-space: nowrap;
}
.key:hover { background: var(--drawdy-surface2, #ececec); border-color: var(--drawdy-primary, #6366f1); }
.key svg { display: block; max-height: 22px; }
.key.text { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }

/* ---- section headings ------------------------------------------------- */
.heading {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 10px 0 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--drawdy-muted-foreground, #888);
}
.heading .editing {
    margin-left: auto;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
    font-size: 11px;
    color: var(--drawdy-primary, #6366f1);
}
.heading .editing button {
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    font-size: 11px;
    color: inherit;
    text-decoration: underline;
}

/* ---- input ---------------------------------------------------------- */
textarea {
    display: block;
    width: 100%;
    min-height: 96px;
    resize: vertical;
    padding: 10px 11px;
    font-size: 13px;
    line-height: 1.55;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--drawdy-foreground, #111);
    background: var(--drawdy-background, #fff);
    border: 1px solid var(--drawdy-border, #e5e5e5);
    border-radius: 8px;
    outline: none;
    tab-size: 2;
}
textarea::placeholder { color: var(--drawdy-muted-foreground, #888); opacity: 0.55; }
textarea:focus { border-color: var(--drawdy-ring, var(--drawdy-primary, #6366f1)); }

/* ---- preview -------------------------------------------------------- */
.stage {
    position: relative;
    min-height: 72px;
    max-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 14px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: var(--drawdy-surface, #f4f4f4);
    overflow: hidden;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    transition: opacity 0.12s, border-color 0.12s;
}
.stage:active { cursor: grabbing; }
.stage.dragging { opacity: 0.35; }
.stage.invalid { border-color: var(--drawdy-destructive, #e5484d); }
.stage.idle { cursor: default; }
.stage svg { display: block; max-width: 100%; }
.stage-note {
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
    color: var(--drawdy-muted-foreground, #888);
    padding: 0 6px;
}
.stage-note.error { color: var(--drawdy-destructive, #e5484d); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

/* ---- primary action --------------------------------------------------- */
.btn {
    appearance: none;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 8px;
    border: 1px solid transparent;
    background: var(--drawdy-primary, #6366f1);
    color: var(--drawdy-primary-foreground, #fff);
}
.btn:hover:not(:disabled) { filter: brightness(0.95); }
.btn:disabled { opacity: 0.45; cursor: default; }

/* ---- boot ----------------------------------------------------------- */
#boot {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--drawdy-muted-foreground, #888);
    background: var(--drawdy-background, #fff);
    z-index: 5;
}
</style>
</head>
<body>
<div id="boot">Loading…</div>
<main id="palette"></main>
<section id="editor">
    <div class="heading">
        <span>LaTeX</span>
        <span id="editing" class="editing" hidden>Editing selected · <button id="editing-cancel" type="button">new instead</button></span>
    </div>
    <textarea id="latex" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Add a LaTeX equation or select a symbol above"></textarea>

    <div class="heading"><span>Preview</span></div>
    <div id="stage" class="stage idle">
        <div id="stage-note" class="stage-note">Type LaTeX above.</div>
        <div id="stage-render"></div>
    </div>

    <button id="insert" class="btn" type="button" disabled title="Insert at the centre of the view. Or drag the preview onto the board.">
        <span id="insert-label">Insert</span>
    </button>
</section>

<script>
window.MathJax = {
    startup: { typeset: false },
    options: { enableMenu: false },
    // 'local' keeps every glyph outline inside the <svg> that uses it, so a
    // serialised equation is self-contained: no font files, no shared <defs>
    // cache living in the panel document that the board could not see.
    svg: { fontCache: "local" }
};
</script>
<script>${MATHJAX_SRC}</script>
<script>
(function () {
    var CONFIG = ${CONFIG};
    var api = acquireDrawdyApi();

    var DRAG_THRESHOLD = 5;
    var RENDER_DEBOUNCE_MS = 120;
    // .stage max-height (120px) minus its 16px top and bottom padding, so a
    // tall equation scales down to fit instead of being clipped.
    var PREVIEW_MAX_H = 88;
    var PREVIEW_MAX_SCALE = 2;
    var ECHO_WINDOW_MS = 5000;
    var DRAG_HINT = "Drag onto the board";

    var $ = function (id) { return document.getElementById(id); };
    var boot = $("boot");
    var palette = $("palette");
    var stage = $("stage");
    var stageNote = $("stage-note");
    var stageRender = $("stage-render");
    var latex = $("latex");
    var insertBtn = $("insert");
    var insertLabel = $("insert-label");
    var editing = $("editing");

    var state = {
        ready: false,
        themeColor: "#111111",
        // How the equation is typeset. A new equation gets the defaults; one
        // picked up from the board keeps whatever it was placed with, so an
        // update never restyles it.
        display: true,
        fontSize: CONFIG.defaultFontSize,
        color: null,
        editingId: null,
        // Last successful render, i.e. exactly what an insert would place.
        rendered: null,
        // Set when we submit an update, so the re-binding that comes back can
        // be told apart from the user genuinely selecting another equation.
        echo: null
    };
    var renderTimer = null;

    /** A null colour means: follow the board theme. */
    function activeColor() {
        return state.color || state.themeColor;
    }

    function resetStyle() {
        state.display = true;
        state.fontSize = CONFIG.defaultFontSize;
        state.color = null;
    }

    /* ---- symbol palette ---------------------------------------------- */

    /** A key's face: the label typeset by MathJax, or monospace text. */
    function keyFace(item) {
        if (!item.text) {
            try {
                var node = window.MathJax.tex2svg(item.label, { display: false });
                var svg = node.querySelector("svg");
                if (svg && !svg.querySelector('[data-mml-node="merror"]')) {
                    svg.removeAttribute("style");
                    return svg;
                }
            } catch (err) {
                // Fall through to plain text.
            }
        }
        return document.createTextNode(item.label);
    }

    function buildPalette() {
        for (var g = 0; g < CONFIG.groups.length; g++) {
            var group = CONFIG.groups[g];
            var section = document.createElement("section");
            section.className = "group";
            var label = document.createElement("p");
            label.className = "group-label";
            label.textContent = group.label;
            section.appendChild(label);
            var keys = document.createElement("div");
            keys.className = "keys";
            for (var k = 0; k < group.items.length; k++) {
                (function (item) {
                    var b = document.createElement("button");
                    b.type = "button";
                    b.className = "key" + (item.text ? " text" : "");
                    b.title = item.title + "  —  " + item.tex.split(CONFIG.caret).join("");
                    b.appendChild(keyFace(item));
                    b.addEventListener("click", function () { insertSnippet(item.tex); });
                    keys.appendChild(b);
                })(group.items[k]);
            }
            section.appendChild(keys);
            palette.appendChild(section);
        }
    }

    /** Splices a snippet in at the caret, honouring the caret marker. */
    function insertSnippet(tex) {
        var caretAt = tex.indexOf(CONFIG.caret);
        var text = caretAt === -1 ? tex : tex.split(CONFIG.caret).join("");
        var start = latex.selectionStart;
        var end = latex.selectionEnd;
        var before = latex.value.slice(0, start);
        var selected = latex.value.slice(start, end);
        var after = latex.value.slice(end);

        // With a selection, a caret-marked snippet wraps it instead of
        // replacing it: select 'x+1', hit √, get \\sqrt{x+1}.
        var body = caretAt === -1 ? text : text.slice(0, caretAt) + selected + text.slice(caretAt);
        latex.value = (before + body + after).slice(0, CONFIG.maxLength);

        var caret = caretAt === -1
            ? start + text.length
            : start + caretAt + selected.length;
        latex.focus();
        latex.setSelectionRange(caret, caret);
        scheduleRender(0);
    }

    /* ---- rendering ---------------------------------------------------- */

    function scheduleRender(delay) {
        if (renderTimer) clearTimeout(renderTimer);
        renderTimer = setTimeout(function () {
            renderTimer = null;
            render();
        }, delay);
    }

    function showNote(text, isError) {
        stageRender.innerHTML = "";
        stageNote.textContent = text;
        stageNote.className = "stage-note" + (isError ? " error" : "");
        stageNote.hidden = false;
        stage.classList.add("idle");
        stage.classList.toggle("invalid", !!isError);
        stage.removeAttribute("title");
        state.rendered = null;
        syncInsert();
    }

    /**
     * Turns a MathJax <svg> into a standalone document sized in board units.
     * MathJax lays out in 1000ths of an em, so the viewBox alone gives an
     * exact px size for any font size; the width/height it writes itself are
     * in 'ex', which means nothing once the SVG is detached from this page.
     */
    function toStandalone(svg, fontSize, color) {
        var vb = (svg.getAttribute("viewBox") || "").split(/\\s+/);
        var w = parseFloat(vb[2]) / 1000 * fontSize;
        var h = parseFloat(vb[3]) / 1000 * fontSize;
        if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return null;

        var clone = svg.cloneNode(true);
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        clone.setAttribute("width", String(w));
        clone.setAttribute("height", String(h));
        // Every glyph is filled with currentColor, so one 'color' on the root
        // recolours the whole equation.
        clone.setAttribute("style", "color: " + color);
        clone.removeAttribute("aria-hidden");
        return {
            markup: new XMLSerializer().serializeToString(clone),
            width: Math.round(w * 100) / 100,
            height: Math.round(h * 100) / 100
        };
    }

    function render() {
        if (!state.ready) return;
        var src = latex.value.trim();
        if (!src) {
            showNote("Type LaTeX above.", false);
            return;
        }

        var node;
        try {
            node = window.MathJax.tex2svg(src, { display: state.display });
        } catch (err) {
            showNote(String((err && err.message) || err), true);
            return;
        }

        var svg = node.querySelector("svg");
        if (!svg) {
            showNote("Could not typeset that.", true);
            return;
        }

        var bad = svg.querySelector('[data-mml-node="merror"]');
        if (bad) {
            var title = bad.querySelector("title");
            showNote(title && title.textContent ? title.textContent : "Invalid LaTeX.", true);
            return;
        }

        var color = activeColor();
        var out = toStandalone(svg, state.fontSize, color);
        if (!out) {
            showNote("Could not measure that equation.", true);
            return;
        }

        state.rendered = {
            latex: src,
            display: state.display,
            fontSize: state.fontSize,
            color: color,
            svg: out.markup,
            width: out.width,
            height: out.height
        };

        // The preview scales to fill the box; the board gets the true size.
        var boxW = Math.max(40, stage.clientWidth - 30);
        var scale = Math.min(boxW / out.width, PREVIEW_MAX_H / out.height, PREVIEW_MAX_SCALE);
        svg.setAttribute("width", String(out.width * scale));
        svg.setAttribute("height", String(out.height * scale));
        svg.setAttribute("style", "color: " + color);

        stageNote.hidden = true;
        stage.classList.remove("idle", "invalid");
        stage.title = DRAG_HINT;
        stageRender.innerHTML = "";
        stageRender.appendChild(svg);
        syncInsert();
    }

    /* ---- placing on the board ------------------------------------------ */

    function setEditing(id) {
        state.editingId = id;
        editing.hidden = id === null;
        insertLabel.textContent = id === null ? "Insert" : "Update";
    }

    /** Back to composing a fresh equation, styled the default way. */
    function stopEditing() {
        setEditing(null);
        resetStyle();
        scheduleRender(0);
    }

    function place(target) {
        if (!state.rendered) return;
        if (state.editingId !== null) {
            api.postMessage({
                type: "update",
                drawdyElementId: state.editingId,
                equation: state.rendered
            });
            state.echo = { latex: state.rendered.latex, until: Date.now() + ECHO_WINDOW_MS };
        } else if (target) {
            api.postMessage({ type: "drop", equation: state.rendered, x: target.x, y: target.y });
        } else {
            api.postMessage({ type: "insert", equation: state.rendered });
        }
    }

    function syncInsert() {
        insertBtn.disabled = state.rendered === null;
    }

    /* ---- wiring -------------------------------------------------------- */

    latex.addEventListener("input", function () {
        if (latex.value.length > CONFIG.maxLength) {
            latex.value = latex.value.slice(0, CONFIG.maxLength);
        }
        scheduleRender(RENDER_DEBOUNCE_MS);
    });

    latex.addEventListener("keydown", function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (!insertBtn.disabled) place(null);
        }
    });

    insertBtn.addEventListener("click", function () { place(null); });
    $("editing-cancel").addEventListener("click", stopEditing);

    // Drag the preview out of the panel to choose where it lands.
    (function enableDrag() {
        var pressing = false;
        var dragging = false;
        var startX = 0;
        var startY = 0;

        stage.addEventListener("pointerdown", function (e) {
            if (!state.rendered) return;
            pressing = true;
            dragging = false;
            startX = e.clientX;
            startY = e.clientY;
            stage.setPointerCapture(e.pointerId);
        });

        stage.addEventListener("pointermove", function (e) {
            if (!pressing || dragging) return;
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
            dragging = true;
            stage.classList.add("dragging");
        });

        stage.addEventListener("pointerup", function (e) {
            if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
            stage.classList.remove("dragging");
            if (!pressing) return;
            pressing = false;
            if (dragging) place({ x: e.clientX, y: e.clientY });
        });

        stage.addEventListener("pointercancel", function (e) {
            if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
            stage.classList.remove("dragging");
            pressing = false;
            dragging = false;
        });
    })();

    window.addEventListener("resize", function () { scheduleRender(60); });

    /* ---- driver messages ------------------------------------------------ */

    api.onMessage(function (raw) {
        if (!raw) return;
        if (raw.type === "init" || raw.type === "styling") {
            if (raw.color) state.themeColor = raw.color;
            if (raw.type === "styling") {
                $("styling").textContent = ":root{" + raw.css + "}";
            }
            // Theme-following ink needs re-typesetting whenever the theme
            // (or, at init, the colour we start from) changes.
            if (raw.type === "init" || state.color === null) {
                scheduleRender(0);
            }
        } else if (raw.type === "edit") {
            // Updating replaces the element, so the board re-selects the
            // replacement and this arrives as an echo of what we just sent.
            // Only the element id is news then: repopulating the fields would
            // throw away whatever the user has typed since.
            var echoed = state.echo !== null
                && Date.now() < state.echo.until
                && raw.latex === state.echo.latex;
            state.echo = null;
            setEditing(raw.drawdyElementId);
            if (!echoed) {
                latex.value = raw.latex;
                state.display = raw.display !== false;
                state.fontSize = raw.fontSize > 0 ? raw.fontSize : CONFIG.defaultFontSize;
                state.color = raw.color || null;
                scheduleRender(0);
                latex.focus();
            }
        } else if (raw.type === "edit-cleared") {
            stopEditing();
        }
    });

    /* ---- boot ------------------------------------------------------------ */

    function start() {
        state.ready = true;
        buildPalette();
        render();
        boot.hidden = true;
        latex.focus();
    }

    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(start).catch(function (err) {
            boot.textContent = "The typesetter failed to start: " + err;
        });
    } else {
        boot.textContent = "The typesetter failed to load.";
    }

    api.postMessage({ type: "ready" });
})();
</script>
</body>
</html>`;

export const WEBVIEW_HTML = BODY;
