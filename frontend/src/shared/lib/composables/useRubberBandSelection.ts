import { onMounted, onUnmounted } from "vue";

const STYLE_ID = "rbs-global-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    tr.rbs-selected > td {
      background-color: rgba(59, 130, 246, 0.12) !important;
      outline: 1px solid rgba(59, 130, 246, 0.3);
      outline-offset: -1px;
    }
    .dark tr.rbs-selected > td {
      background-color: rgba(96, 165, 250, 0.15) !important;
      outline-color: rgba(96, 165, 250, 0.35);
    }
    .rbs-rect {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      border: 1px solid rgba(59, 130, 246, 0.55);
      background: rgba(59, 130, 246, 0.06);
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);
}

async function writeToClipboard(tsv: string, html: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([tsv], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  } catch {
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      const el = document.createElement("textarea");
      el.value = tsv;
      el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }
}

export default function useRubberBandSelection() {
  let rect: HTMLDivElement | null = null;
  let activeTbody: HTMLElement | null = null;
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  const selectedTrs = new Set<HTMLElement>();

  function createRect() {
    rect = document.createElement("div");
    rect.className = "rbs-rect";
    rect.style.display = "none";
    document.body.appendChild(rect);
  }

  function destroyRect() {
    rect?.remove();
    rect = null;
  }

  function showRect(x: number, y: number, w: number, h: number) {
    if (!rect) return;
    rect.style.display = w > 3 || h > 3 ? "block" : "none";
    rect.style.left = `${x}px`;
    rect.style.top = `${y}px`;
    rect.style.width = `${w}px`;
    rect.style.height = `${h}px`;
  }

  function hideRect() {
    if (rect) rect.style.display = "none";
  }

  function clearSelection() {
    activeTbody
      ?.querySelectorAll("tr.rbs-selected")
      .forEach((tr) => tr.classList.remove("rbs-selected"));
    selectedTrs.clear();
  }

  function updateSelection(
    left: number,
    top: number,
    right: number,
    bottom: number
  ) {
    if (!activeTbody) return;
    selectedTrs.clear();

    activeTbody.querySelectorAll<HTMLElement>("tr").forEach((tr) => {
      const r = tr.getBoundingClientRect();
      const hit =
        r.bottom >= top &&
        r.top <= bottom &&
        r.right >= left &&
        r.left <= right;
      tr.classList.toggle("rbs-selected", hit);
      if (hit) selectedTrs.add(tr);
    });
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (
      target.closest(
        "input, button, a, select, .p-sortable-column, .p-column-filter-row, .p-paginator"
      )
    )
      return;

    const tbody = target.closest<HTMLElement>(".p-datatable-tbody");
    if (!tbody) return;

    e.preventDefault();
    activeTbody = tbody;
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    clearSelection();
  }

  function onMouseMove(e: MouseEvent) {
    if (!isSelecting) return;

    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);

    showRect(x, y, w, h);
    updateSelection(x, y, x + w, y + h);
  }

  function onMouseUp() {
    if (!isSelecting) return;
    isSelecting = false;
    hideRect();
  }

  function getThead(): HTMLElement | null {
    return (
      activeTbody
        ?.closest(".p-datatable-table")
        ?.querySelector<HTMLElement>(".p-datatable-thead") ?? null
    );
  }

  function visibleThs(tr: HTMLElement): HTMLElement[] {
    return Array.from(tr.querySelectorAll<HTMLElement>("th")).filter(
      (th) => getComputedStyle(th).display !== "none"
    );
  }

  // TSV: sparse — first cell of each span gets text, rest blank
  function getHeaderLines(): string[] {
    const thead = getThead();
    if (!thead) return [];

    const rows = Array.from(thead.querySelectorAll("tr"));
    const grid: string[][] = rows.map(() => []);
    const pendingRowspan: Map<number, number> = new Map();

    rows.forEach((tr, rowIdx) => {
      let col = 0;
      visibleThs(tr).forEach((th) => {
        while ((pendingRowspan.get(col) ?? 0) > rowIdx) col++;

        const colspan = parseInt(th.getAttribute("colspan") ?? "1", 10);
        const rowspan = parseInt(th.getAttribute("rowspan") ?? "1", 10);
        const text = th.innerText.trim();

        for (let c = 0; c < colspan; c++) {
          grid[rowIdx][col + c] = c === 0 ? text : "";
          if (rowspan > 1) {
            for (let r = rowIdx + 1; r < rowIdx + rowspan; r++) {
              if (!grid[r]) grid[r] = [];
              grid[r][col + c] = "";
            }
            pendingRowspan.set(col + c, rowIdx + rowspan);
          }
        }
        col += colspan;
      });
    });

    return grid.map((row) => row.join("\t"));
  }

  // HTML: preserve colspan/rowspan so spreadsheet apps render merged cells
  function buildHtml(): string {
    const thead = getThead();

    let headerHtml = "";
    if (thead) {
      headerHtml = "<thead>";
      Array.from(thead.querySelectorAll("tr")).forEach((tr) => {
        headerHtml += "<tr>";
        visibleThs(tr).forEach((th) => {
          const colspan = th.getAttribute("colspan");
          const rowspan = th.getAttribute("rowspan");
          const attrs = [
            colspan ? `colspan="${colspan}"` : "",
            rowspan ? `rowspan="${rowspan}"` : "",
          ]
            .filter(Boolean)
            .join(" ");
          headerHtml += `<th ${attrs} style="background-color:#c8c8c8;font-weight:bold;padding:4px 8px;text-align:center;">${th.innerText.trim()}</th>`;
        });
        headerHtml += "</tr>";
      });
      headerHtml += "</thead>";
    }

    let bodyHtml = "<tbody>";
    selectedTrs.forEach((tr) => {
      bodyHtml += "<tr>";
      tr.querySelectorAll<HTMLElement>("td").forEach((td, i) => {
        const style =
          i === 0 ? ' style="background-color:#c8c8c8;font-weight:bold;"' : "";
        bodyHtml += `<td${style}>${td.innerText.trim()}</td>`;
      });
      bodyHtml += "</tr>";
    });
    bodyHtml += "</tbody>";

    return `<table>${headerHtml}${bodyHtml}</table>`;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "c") return;
    if (selectedTrs.size === 0) return;

    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA"))
      return;

    const lines: string[] = [...getHeaderLines()];
    selectedTrs.forEach((tr) => {
      const line = Array.from(tr.querySelectorAll<HTMLElement>("td"))
        .map((td) => td.innerText.trim())
        .join("\t");
      lines.push(line);
    });

    writeToClipboard(lines.join("\n"), buildHtml());
  }

  onMounted(() => {
    ensureStyles();
    createRect();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);
  });

  onUnmounted(() => {
    destroyRect();
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("keydown", onKeyDown);
  });
}
