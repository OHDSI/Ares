import { onMounted, onUnmounted, ref, computed } from "vue";
import { writeToClipboard } from "@/shared/lib/clipboard";

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
  `;
  document.head.appendChild(style);
}

const MIN_DRAG = 8;

export default function useRubberBandSelection() {
  let rect: HTMLDivElement | null = null;
  let activeTbody: HTMLElement | null = null;
  let isSelecting = false;
  let hasDragged = false;
  let startX = 0;
  let startY = 0;
  const selectedTrs = new Set<HTMLElement>();

  const copyVisible = ref(false);
  const copyPos = ref({ x: 0, y: 0 });
  const copyText = computed(() => buildTsv());
  const rbsCopied = ref(false);

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

  function onCopied() {
    setTimeout(() => {
      copyVisible.value = false;
      rbsCopied.value = false;
      clearSelection();
    }, 700);
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
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    copyVisible.value = false;
    clearSelection();
  }

  function onMouseMove(e: MouseEvent) {
    if (!isSelecting) return;

    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);

    if (!hasDragged && Math.sqrt(w * w + h * h) >= MIN_DRAG) {
      hasDragged = true;
    }
    if (!hasDragged) return;

    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);

    showRect(x, y, w, h);
    updateSelection(x, y, x + w, y + h);
  }

  function onMouseUp(e: MouseEvent) {
    if (!isSelecting) return;
    isSelecting = false;
    hideRect();
    if (hasDragged && selectedTrs.size > 0) {
      const bw = 80;
      const bh = 28;
      copyPos.value = {
        x: Math.min(e.clientX + 12, window.innerWidth - bw - 8),
        y: Math.min(e.clientY + 12, window.innerHeight - bh - 8),
      };
      copyVisible.value = true;
    }
  }

  function onDismissMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".rbs-floating-copy")) return;
    copyVisible.value = false;
    clearSelection();
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
    writeToClipboard(buildTsv(), buildHtml());
    copyVisible.value = true;
    rbsCopied.value = true;
    onCopied();
  }

  onMounted(() => {
    ensureStyles();
    createRect();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousedown", onDismissMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("copy", onCopy);
  });

  onUnmounted(() => {
    destroyRect();
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousedown", onDismissMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("copy", onCopy);
  });

  return { copyVisible, copyPos, copyText, rbsCopied, onCopied };
}
