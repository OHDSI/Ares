import { onMounted, onUnmounted } from "vue";

const STYLE_ID = "rbs-global-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    tr.rbs-selected > td {
      box-shadow: inset 0 0 0 1000px rgba(59, 130, 246, 0.12);
      outline: 1px solid rgba(59, 130, 246, 0.3);
      outline-offset: -1px;
    }
    .dark tr.rbs-selected > td {
      box-shadow: inset 0 0 0 1000px rgba(96, 165, 250, 0.15);
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
    .rbs-copy-btn {
      position: fixed;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      line-height: 1.4;
      color: #2563eb;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(96, 165, 250, 0.55);
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(6px);
      transition: background 0.12s, color 0.12s, border-color 0.12s;
      user-select: none;
    }
    .rbs-copy-btn:hover {
      background: rgba(239, 246, 255, 0.98);
      border-color: rgba(59, 130, 246, 0.7);
    }
    .rbs-copy-btn.rbs-copied {
      color: #16a34a;
      border-color: rgba(22, 163, 74, 0.4);
    }
    .dark .rbs-copy-btn {
      color: #93c5fd;
      background: rgba(33, 33, 33, 0.95);
      border-color: rgba(96, 165, 250, 0.4);
    }
    .dark .rbs-copy-btn:hover {
      background: rgba(45, 45, 45, 0.98);
      border-color: rgba(96, 165, 250, 0.65);
    }
    .dark .rbs-copy-btn.rbs-copied {
      color: #4ade80;
      border-color: rgba(74, 222, 128, 0.35);
    }
    @keyframes rbs-row-out {
      from {
        box-shadow: inset 0 0 0 1000px rgba(59, 130, 246, 0.12);
        outline: 1px solid rgba(59, 130, 246, 0.3);
        outline-offset: -1px;
      }
      to {
        box-shadow: inset 0 0 0 1000px rgba(59, 130, 246, 0);
        outline: 1px solid transparent;
        outline-offset: -1px;
      }
    }
    @keyframes rbs-row-out-dark {
      from {
        box-shadow: inset 0 0 0 1000px rgba(96, 165, 250, 0.15);
        outline: 1px solid rgba(96, 165, 250, 0.35);
        outline-offset: -1px;
      }
      to {
        box-shadow: inset 0 0 0 1000px rgba(96, 165, 250, 0);
        outline: 1px solid transparent;
        outline-offset: -1px;
      }
    }
    tr.rbs-fading > td {
      animation: rbs-row-out 0.2s ease forwards;
    }
    .dark tr.rbs-fading > td {
      animation-name: rbs-row-out-dark;
    }
    @keyframes rbs-btn-out {
      to {
        opacity: 0;
        transform: translateY(3px);
      }
    }
    .rbs-copy-btn.rbs-dismissing {
      animation: rbs-btn-out 0.13s ease forwards;
      pointer-events: none;
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

const COPY_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

export default function useRubberBandSelection() {
  let rect: HTMLDivElement | null = null;
  let copyBtn: HTMLButtonElement | null = null;
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
    const rows = Array.from(
      activeTbody?.querySelectorAll<HTMLElement>("tr.rbs-selected") ?? []
    );
    rows.forEach((tr) => {
      tr.classList.remove("rbs-selected");
      tr.classList.add("rbs-fading");
    });
    selectedTrs.clear();
    setTimeout(
      () => rows.forEach((tr) => tr.classList.remove("rbs-fading")),
      220
    );
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
      if (hit) {
        tr.classList.remove("rbs-fading");
        selectedTrs.add(tr);
      }
    });
  }

  function buildTsv(): string {
    const lines: string[] = [...getHeaderLines()];
    selectedTrs.forEach((tr) => {
      const line = Array.from(tr.querySelectorAll<HTMLElement>("td"))
        .map((td) => td.innerText.trim())
        .join("\t");
      lines.push(line);
    });
    return lines.join("\n");
  }

  function doCopy() {
    writeToClipboard(buildTsv(), buildHtml());
  }

  function triggerCopiedFeedback() {
    if (copyBtn) {
      copyBtn.classList.add("rbs-copied");
      copyBtn.innerHTML = `${CHECK_ICON}<span>Copied</span>`;
    }
    setTimeout(() => {
      destroyCopyBtn();
      clearSelection();
    }, 700);
  }

  function destroyCopyBtn(animate = true) {
    if (!copyBtn) return;
    document.removeEventListener("mousedown", onDismissMouseDown);
    const btn = copyBtn;
    copyBtn = null;
    if (animate && btn.isConnected) {
      btn.classList.add("rbs-dismissing");
      setTimeout(() => btn.remove(), 140);
    } else {
      btn.remove();
    }
  }

  function onDismissMouseDown(e: MouseEvent) {
    if (
      copyBtn &&
      e.target !== copyBtn &&
      !copyBtn.contains(e.target as Node)
    ) {
      destroyCopyBtn();
      clearSelection();
    }
  }

  function showCopyBtn(cursorX: number, cursorY: number) {
    destroyCopyBtn();

    const btn = document.createElement("button");
    btn.className = "rbs-copy-btn";
    btn.innerHTML = `${COPY_ICON}<span>Copy</span>`;
    document.body.appendChild(btn);

    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    const left = Math.min(cursorX + 12, window.innerWidth - bw - 8);
    const top = Math.min(cursorY + 12, window.innerHeight - bh - 8);
    btn.style.left = `${left}px`;
    btn.style.top = `${top}px`;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      doCopy();
      triggerCopiedFeedback();
    });

    copyBtn = btn;
    document.addEventListener("mousedown", onDismissMouseDown);
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

  function onMouseUp(e: MouseEvent) {
    if (!isSelecting) return;
    isSelecting = false;
    hideRect();
    if (selectedTrs.size > 0) {
      showCopyBtn(e.clientX, e.clientY);
    }
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

  function getThText(th: HTMLElement): string {
    const clone = th.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll(".fi-wrap, .filter-dropdown, .smd-filter")
      .forEach((el) => el.remove());
    return clone.innerText.trim();
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
        const text = getThText(th);

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

    return grid
      .map((row) => row.join("\t"))
      .filter((line) => line.replace(/\t/g, "").length > 0);
  }

  // HTML: preserve colspan/rowspan so spreadsheet apps render merged cells
  function buildHtml(): string {
    const thead = getThead();

    let headerHtml = "";
    if (thead) {
      const allRows = Array.from(thead.querySelectorAll("tr"));
      const skipped = new Set(
        allRows.reduce<number[]>((acc, tr, i) => {
          const ths = visibleThs(tr);
          if (ths.length > 0 && ths.every((th) => getThText(th) === ""))
            acc.push(i);
          return acc;
        }, [])
      );

      headerHtml = "<thead>";
      allRows.forEach((tr, rowIdx) => {
        if (skipped.has(rowIdx)) return;
        headerHtml += "<tr>";
        visibleThs(tr).forEach((th) => {
          const colspan = th.getAttribute("colspan");
          let rowspan = parseInt(th.getAttribute("rowspan") ?? "1", 10);
          for (let r = rowIdx + 1; r < rowIdx + rowspan; r++) {
            if (skipped.has(r)) rowspan--;
          }
          const attrs = [
            colspan ? `colspan="${colspan}"` : "",
            rowspan > 1 ? `rowspan="${rowspan}"` : "",
          ]
            .filter(Boolean)
            .join(" ");
          headerHtml += `<th ${attrs} style="background-color:#c8c8c8;font-weight:bold;padding:4px 8px;text-align:center;">${getThText(
            th
          )}</th>`;
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

  function onCopy(e: ClipboardEvent) {
    if (selectedTrs.size === 0) return;

    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA"))
      return;

    e.preventDefault();
    doCopy();
    triggerCopiedFeedback();
  }

  onMounted(() => {
    ensureStyles();
    createRect();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("copy", onCopy);
  });

  onUnmounted(() => {
    destroyRect();
    destroyCopyBtn(false);
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("copy", onCopy);
  });
}
