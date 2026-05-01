<template>
  <div class="export-menu">
    <Tooltip text="Export">
      <button class="export-trigger" @click.stop="toggle">
        <svg-icon type="mdi" :path="mdiTableArrowRight" class="trigger-icon" />
      </button>
    </Tooltip>

    <Transition name="export-pop">
      <div v-if="isOpen" class="export-panel">
        <button class="export-item" @click.stop="copyPage">
          <i class="pi pi-clone" />
          Copy page
        </button>
        <button
          class="export-item"
          :disabled="!rows?.length"
          @click.stop="copyTable"
        >
          <i class="pi pi-copy" />
          Copy table
        </button>
        <div class="export-sep" />
        <button
          class="export-item"
          :disabled="!rows?.length"
          @click.stop="saveCsv"
        >
          <i class="pi pi-download" />
          Save as CSV
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import SvgIcon from "@/shared/ui/svgIcon";
import Tooltip from "@/shared/ui/tooltip";
import { mdiTableArrowRight } from "@mdi/js";

interface Props {
  tableRef: { $el?: HTMLElement } | null;
  rows?: Record<string, unknown>[];
  filename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rows: undefined,
  filename: "export",
});

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

onMounted(() => document.addEventListener("click", close));
onUnmounted(() => document.removeEventListener("click", close));

function getTableEl(): HTMLElement | null {
  return props.tableRef?.$el ?? null;
}

function getThead(): HTMLElement | null {
  return getTableEl()?.querySelector(".p-datatable-thead") ?? null;
}

function getTbody(): HTMLElement | null {
  return getTableEl()?.querySelector(".p-datatable-tbody") ?? null;
}

function visibleThs(tr: HTMLElement): HTMLElement[] {
  return Array.from(tr.querySelectorAll<HTMLElement>("th")).filter(
    (th) => getComputedStyle(th).display !== "none"
  );
}

function buildHeaderHtml(thead: HTMLElement): string {
  let html = "<thead>";
  Array.from(thead.querySelectorAll("tr")).forEach((tr) => {
    html += "<tr>";
    visibleThs(tr).forEach((th) => {
      const colspan = th.getAttribute("colspan");
      const rowspan = th.getAttribute("rowspan");
      const attrs = [
        colspan ? `colspan="${colspan}"` : "",
        rowspan ? `rowspan="${rowspan}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      html += `<th ${attrs} style="background-color:#c8c8c8;font-weight:bold;padding:4px 8px;text-align:center;">${th.innerText.trim()}</th>`;
    });
    html += "</tr>";
  });
  return html + "</thead>";
}

function buildHeaderLines(thead: HTMLElement): string[] {
  const rows = Array.from(thead.querySelectorAll("tr"));
  const grid: string[][] = rows.map(() => []);
  const pending = new Map<number, number>();

  rows.forEach((tr, rowIdx) => {
    let col = 0;
    visibleThs(tr).forEach((th) => {
      while ((pending.get(col) ?? 0) > rowIdx) col++;
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
          pending.set(col + c, rowIdx + rowspan);
        }
      }
      col += colspan;
    });
  });

  return grid.map((row) => row.join("\t"));
}

async function write(tsv: string, html: string) {
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

function visibleTds(tr: HTMLElement): HTMLElement[] {
  return Array.from(tr.querySelectorAll<HTMLElement>("td")).filter(
    (td) => getComputedStyle(td).display !== "none"
  );
}

function domRowsToHtmlAndTsv(trs: HTMLElement[]): {
  html: string;
  tsv: string;
} {
  let bodyHtml = "<tbody>";
  const tsvLines: string[] = [];

  trs.forEach((tr) => {
    const cells = visibleTds(tr);
    const texts = cells.map((td) => td.innerText.trim());
    bodyHtml += "<tr>";
    texts.forEach((text, i) => {
      const style =
        i === 0 ? ' style="background-color:#c8c8c8;font-weight:bold;"' : "";
      bodyHtml += `<td${style}>${text}</td>`;
    });
    bodyHtml += "</tr>";
    tsvLines.push(texts.join("\t"));
  });

  bodyHtml += "</tbody>";
  return { html: bodyHtml, tsv: tsvLines.join("\n") };
}

function copyPage() {
  close();
  const thead = getThead();
  const tbody = getTbody();
  if (!tbody) return;

  const trs = Array.from(tbody.querySelectorAll<HTMLElement>("tr"));
  const { html: bodyHtml, tsv: bodyTsv } = domRowsToHtmlAndTsv(trs);

  const headerLines = thead ? buildHeaderLines(thead) : [];
  const headerHtml = thead ? buildHeaderHtml(thead) : "";

  const tsv = [...headerLines, bodyTsv].join("\n");
  const html = `<table>${headerHtml}${bodyHtml}</table>`;
  write(tsv, html);
}

function copyTable() {
  close();
  if (!props.rows?.length) return;
  const keys = Object.keys(props.rows[0]);

  const headerHtml = `<thead><tr>${keys
    .map(
      (k, i) =>
        `<th style="background-color:#c8c8c8;font-weight:bold;padding:4px 8px;${
          i === 0 ? "text-align:left;" : "text-align:center;"
        }">${k}</th>`
    )
    .join("")}</tr></thead>`;

  const headerLine = keys.join("\t");

  const tsvLines: string[] = [];
  let bodyHtml = "<tbody>";
  props.rows.forEach((row) => {
    const vals = keys.map((k) => String(row[k] ?? ""));
    tsvLines.push(vals.join("\t"));
    bodyHtml += "<tr>";
    vals.forEach((v, i) => {
      const style =
        i === 0 ? ' style="background-color:#c8c8c8;font-weight:bold;"' : "";
      bodyHtml += `<td${style}>${v}</td>`;
    });
    bodyHtml += "</tr>";
  });
  bodyHtml += "</tbody>";

  const tsv = [headerLine, ...tsvLines].join("\n");
  const html = `<table>${headerHtml}${bodyHtml}</table>`;
  write(tsv, html);
}

function saveCsv() {
  close();
  if (!props.rows?.length) return;
  const keys = Object.keys(props.rows[0]);

  const escape = (v: string) =>
    v.includes(",") || v.includes('"') || v.includes("\n")
      ? `"${v.replace(/"/g, '""')}"`
      : v;

  const lines = [
    keys.map(escape).join(","),
    ...props.rows.map((row) =>
      keys.map((k) => escape(String(row[k] ?? ""))).join(",")
    ),
  ].join("\n");

  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${props.filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.export-menu {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.export-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.export-trigger:hover {
  background: var(--color-active-bg);
  color: var(--color-interactive-hover);
}

.trigger-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.export-panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 148px;
  padding: 4px;
  border-radius: 8px;
  background: var(--p-surface-0, #fff);
  border: 1px solid var(--p-surface-200, #e2e8f0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
}

.dark .export-panel {
  background: var(--p-surface-800, #1e293b);
  border-color: var(--p-surface-600, #475569);
}

.export-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--color-text-label);
  font-size: 0.78rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.export-item:hover:not(:disabled) {
  background: var(--color-active-bg);
  color: var(--color-interactive-hover);
}

.export-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.export-item .pi {
  font-size: 0.75rem;
  opacity: 0.7;
}

.export-sep {
  height: 1px;
  margin: 3px 6px;
  background: var(--p-surface-200, #e2e8f0);
}

.dark .export-sep {
  background: var(--p-surface-600, #475569);
}

.export-pop-enter-active,
.export-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.export-pop-enter-from,
.export-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
