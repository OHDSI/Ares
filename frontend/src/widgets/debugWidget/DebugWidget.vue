<template>
  <Teleport to="body">
    <div
      ref="widgetRef"
      class="dev-widget"
      :class="{
        'dev-widget--menu': state === 'menu',
        'dev-widget--tool': state === 'tool',
        'dev-widget--dragging': isDragging || inertiaActive,
      }"
      :style="{ right: pos.x + 'px', bottom: pos.y + 'px' }"
    >
      <button
        class="widget-trigger"
        @mousedown.stop="(e) => onTriggerMousedown(e, openMenu)"
        title="Dev Tools"
      >
        <i class="pi pi-cog" />
        <span class="trigger-label">Dev Tools</span>
      </button>

      <div class="widget-menu">
        <div class="menu-header" @mousedown.stop="startDrag">
          <span class="menu-title">Dev Tools</span>
          <button
            class="panel-btn panel-btn--close"
            @click.stop="closeWidget"
            title="Close"
          >
            <i class="pi pi-times" />
          </button>
        </div>
        <div class="menu-grid">
          <!-- SQL -->
          <button class="menu-tool-card" @click.stop="openTool('sql')">
            <i class="pi pi-code tool-icon" />
            <span class="tool-name">SQL</span>
            <span class="tool-desc">Query monitor</span>
          </button>
          <!-- DuckDB -->
          <button class="menu-tool-card" @click.stop="openTool('duckdb')">
            <i class="pi pi-database tool-icon" />
            <span class="tool-name">DuckDB</span>
            <span class="tool-desc">WASM queries</span>
          </button>
          <!-- State () -->
          <button class="menu-tool-card menu-tool-card--soon" disabled>
            <i class="pi pi-table tool-icon" />
            <span class="tool-name">Vacant spot</span>
            <span class="tool-desc">tbd</span>
          </button>
          <!-- Logs -->
          <button class="menu-tool-card" @click.stop="openTool('logs')">
            <i class="pi pi-list tool-icon" />
            <span class="tool-name">Logs</span>
            <span class="tool-desc">Backend output</span>
          </button>
        </div>
      </div>

      <div class="widget-panel">
        <SqlTool
          v-if="activeTool === 'sql'"
          :interval-sec="intervalSec"
          @back="backToMenu"
          @close="closeWidget"
        />
        <LogsTool
          v-else-if="activeTool === 'logs'"
          :interval-sec="intervalSec"
          @back="backToMenu"
          @close="closeWidget"
        />
        <DuckdbTool
          v-else-if="activeTool === 'duckdb'"
          :interval-sec="intervalSec"
          @back="backToMenu"
          @close="closeWidget"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, provide, nextTick } from "vue";
import SqlTool from "./tools/sqlTool";
import LogsTool from "./tools/logsTool";
import DuckdbTool from "./tools/duckdbTool";
import { useDrag } from "./composables/useDrag";

type WidgetState = "collapsed" | "menu" | "tool";
type ToolName = "sql" | "duckdb" | "logs";

defineProps({
  intervalSec: { type: Number, default: 2 },
});

const state = ref<WidgetState>("collapsed");
const activeTool = ref<ToolName | null>(null);
const widgetRef = ref(null);

const COLLAPSED_W = 120;
const COLLAPSED_H = 36;
const PANEL_W = 520;
const PANEL_H = 480;
const MENU_W = 264;
let _menuH = 216;

function sizeOf(s: WidgetState): [number, number] {
  if (s === "menu") return [MENU_W, _menuH];
  if (s === "tool") return [PANEL_W, PANEL_H];
  return [COLLAPSED_W, COLLAPSED_H];
}

const { pos, isDragging, inertiaActive, startDrag, onTriggerMousedown, clamp } =
  useDrag(state, sizeOf);

provide("startDrag", startDrag);

async function measureAndApplyMenuSize() {
  await nextTick();
  if (!widgetRef.value) return;
  const headerEl = widgetRef.value.querySelector(".menu-header");
  const gridEl = widgetRef.value.querySelector(".menu-grid");
  if (!headerEl || !gridEl) return;
  const mh = headerEl.offsetHeight + gridEl.offsetHeight + 2;
  _menuH = mh;
  widgetRef.value.style.setProperty("--menu-w", MENU_W + "px");
  widgetRef.value.style.setProperty("--menu-h", mh + "px");
}

function openMenu() {
  const cx = pos.value.x + COLLAPSED_W / 2;
  const cy = pos.value.y + COLLAPSED_H / 2;
  if (widgetRef.value) {
    widgetRef.value.style.setProperty("--menu-w", MENU_W + "px");
    widgetRef.value.style.setProperty("--menu-h", _menuH + "px");
  }
  state.value = "menu";
  const [mw, mh] = sizeOf("menu");
  pos.value = clamp(cx - mw / 2, cy - mh / 2, "menu");
}

function openTool(tool: ToolName) {
  const [mw, mh] = sizeOf("menu");
  const cx = pos.value.x + mw / 2;
  const cy = pos.value.y + mh / 2;
  pos.value = clamp(cx - PANEL_W / 2, cy - PANEL_H / 2, "tool");
  activeTool.value = tool;
  state.value = "tool";
}

async function backToMenu() {
  const cx = pos.value.x + PANEL_W / 2;
  const cy = pos.value.y + PANEL_H / 2;
  activeTool.value = null;
  state.value = "menu";
  await measureAndApplyMenuSize();
  const [mw, mh] = sizeOf("menu");
  pos.value = clamp(cx - mw / 2, cy - mh / 2, "menu");
}

function closeWidget() {
  const [sw, sh] = sizeOf(state.value);
  const cx = pos.value.x + sw / 2;
  const cy = pos.value.y + sh / 2;
  pos.value = clamp(cx - COLLAPSED_W / 2, cy - COLLAPSED_H / 2, "collapsed");
  activeTool.value = null;
  state.value = "collapsed";
}
</script>

<style scoped>
.dev-widget {
  --w-bg: #ffffff;
  --w-bg-raised: #f3f4f6;
  --w-bg-item: #f9fafb;
  --w-bg-item-meta: #f3f4f6;
  --w-bg-err: #fef2f2;
  --w-bg-wait: #fffbeb;
  --w-bg-btn-hover: #e5e7eb;
  --w-border: #e2e8f0;
  --w-border-item: #e5e7eb;
  --w-border-err: #fca5a5;
  --w-border-wait: #fde68a;
  --w-text: #111827;
  --w-text-secondary: #6b7280;
  --w-text-muted: #9ca3af;
  --w-text-tab: #9ca3af;
  --w-text-tab-hover: #6b7280;
  --w-text-tab-active: #111827;
  --w-text-btn: #9ca3af;
  --w-text-btn-hover: #374151;
  --w-text-err: #dc2626;
  --w-text-err-msg: #ef4444;
  --w-text-wait: #d97706;
  --w-sql: #4338ca;
  --w-dot-idle: #d1d5db;
  --w-tab-count-bg: #e5e7eb;
  --w-tab-count-text: #6b7280;
  --w-scrollbar: #d1d5db;
  --w-collapsed-bg: #1e293b;
  --w-collapsed-border: rgba(255, 255, 255, 0.06);
  --w-collapsed-color: #e2e8f0;
  --w-shadow-collapsed: 0 2px 12px rgba(0, 0, 0, 0.18),
    0 1px 3px rgba(0, 0, 0, 0.1);
  --w-shadow-open: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

:global(.dark .dev-widget) {
  --w-bg: #13161e;
  --w-bg-raised: #1c2030;
  --w-bg-item: #1a1f2e;
  --w-bg-item-meta: #1c2030;
  --w-bg-err: #2d1a1a;
  --w-bg-wait: #1e1a12;
  --w-bg-btn-hover: #2a2f3a;
  --w-border: #2a2f3a;
  --w-border-item: #2a2f3a;
  --w-border-err: rgba(127, 29, 29, 0.4);
  --w-border-wait: rgba(120, 53, 15, 0.4);
  --w-text: #c9d1e0;
  --w-text-secondary: #8892a4;
  --w-text-muted: #4b5563;
  --w-text-tab: #5a6478;
  --w-text-tab-hover: #8892a4;
  --w-text-tab-active: #c9d1e0;
  --w-text-btn: #5a6478;
  --w-text-btn-hover: #c9d1e0;
  --w-text-err: #f87171;
  --w-text-err-msg: #f87171;
  --w-text-wait: #f59e0b;
  --w-sql: #a5b4fc;
  --w-dot-idle: #374151;
  --w-tab-count-bg: #374151;
  --w-tab-count-text: #9ca3af;
  --w-scrollbar: #2a2f3a;
  --w-collapsed-bg: #1c2030;
  --w-collapsed-border: rgba(255, 255, 255, 0.07);
  --w-collapsed-color: #c9d1e0;
  --w-shadow-collapsed: 0 2px 16px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  --w-shadow-open: 0 8px 32px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.dev-widget {
  position: fixed;
  z-index: 9999;
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 12px;
  overflow: hidden;
  width: 120px;
  height: 36px;
  border-radius: 10px;
  background: var(--w-collapsed-bg);
  border: 1px solid var(--w-collapsed-border);
  box-shadow: var(--w-shadow-collapsed);
  transition: width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    right 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    bottom 0.32s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.28s ease,
    background 0.22s ease, border-color 0.22s ease, box-shadow 0.32s ease;
}
:global(.dev-widget--dragging) {
  transition: background 0.22s ease, border-color 0.22s ease,
    box-shadow 0.32s ease !important;
}
.dev-widget--menu {
  width: var(--menu-w, 264px);
  height: var(--menu-h, 212px);
  border-radius: 10px;
  background: var(--w-bg);
  border-color: var(--w-border);
  box-shadow: var(--w-shadow-open);
}
.dev-widget--tool {
  width: 520px;
  height: 480px;
  border-radius: 10px;
  background: var(--w-bg);
  border-color: var(--w-border);
  box-shadow: var(--w-shadow-open);
}

.widget-trigger {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px 0 11px;
  border: none;
  background: transparent;
  color: var(--w-collapsed-color);
  cursor: grab;
  white-space: nowrap;
  user-select: none;
  font-size: 13px;
  opacity: 1;
  transition: opacity 0.1s ease;
}
.widget-trigger:active {
  cursor: grabbing;
}
.dev-widget--menu .widget-trigger,
.dev-widget--tool .widget-trigger {
  opacity: 0;
  pointer-events: none;
}
.trigger-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.7;
}

.widget-menu {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  color: var(--w-text);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease 0.16s;
}
.dev-widget--menu .widget-menu {
  opacity: 1;
  pointer-events: all;
}
.dev-widget:not(.dev-widget--menu) .widget-menu {
  transition: opacity 0.1s ease;
}
.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 12px;
  height: 36px;
  border-bottom: 1px solid var(--w-border);
  background: var(--w-bg-raised);
  cursor: grab;
  flex-shrink: 0;
  border-radius: 10px 10px 0 0;
}
.menu-header:active {
  cursor: grabbing;
}
.menu-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--w-text-secondary);
}
.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px 8px 12px;
}
.menu-tool-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  min-height: 76px;
  border: 1px solid var(--w-border);
  border-radius: 7px;
  background: var(--w-bg-item);
  color: var(--w-text);
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  user-select: none;
}
.menu-tool-card:hover:not(:disabled) {
  background: var(--w-bg-btn-hover);
  border-color: #3b82f6;
}
.menu-tool-card:active:not(:disabled) {
  background: rgba(59, 130, 246, 0.08);
}
.menu-tool-card--soon {
  opacity: 0.45;
  cursor: default;
}
.tool-icon {
  color: var(--w-text-secondary);
  font-size: 20px;
  flex-shrink: 0;
}
.menu-tool-card:hover:not(:disabled) .tool-icon {
  color: #3b82f6;
}
.tool-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.tool-desc {
  font-size: 9px;
  color: var(--w-text-muted);
  letter-spacing: 0.02em;
}
.tool-soon {
  position: absolute;
  top: 5px;
  right: 6px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--w-tab-count-bg);
  color: var(--w-tab-count-text);
  border-radius: 3px;
  padding: 1px 4px;
}

.widget-panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  color: var(--w-text);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease 0.16s;
}
.dev-widget--tool .widget-panel {
  opacity: 1;
  pointer-events: all;
}
.dev-widget:not(.dev-widget--tool) .widget-panel {
  transition: opacity 0.1s ease;
}
</style>

<style>
.dev-widget .panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 0;
  background: var(--w-bg-raised);
  border-bottom: 1px solid var(--w-border);
  cursor: grab;
  flex-shrink: 0;
}
.dev-widget .panel-header:active {
  cursor: grabbing;
}

.dev-widget .panel-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--w-text-btn);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s;
  border-right: 1px solid var(--w-border);
  margin-right: 2px;
  font-size: 14px;
}
.dev-widget .panel-back-btn:hover {
  color: var(--w-text-btn-hover);
}

.dev-widget .panel-tabs {
  display: flex;
  align-items: stretch;
  flex: 1;
}
.dev-widget .panel-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 9px 13px;
  border: none;
  background: transparent;
  color: var(--w-text-tab);
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}
.dev-widget .panel-tab:hover {
  color: var(--w-text-tab-hover);
}
.dev-widget .panel-tab--active {
  color: var(--w-text-tab-active);
  border-bottom-color: #3b82f6;
}

.dev-widget .panel-title-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.3s;
}
.dev-widget .dot-active {
  background: #22c55e;
  box-shadow: 0 0 5px #22c55e88;
  animation: dw-pulse-dot 2s ease-in-out infinite;
}
.dev-widget .dot-idle {
  background: var(--w-dot-idle);
}

@keyframes dw-pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.dev-widget .tab-count {
  font-size: 10px;
  font-weight: 700;
  background: #3b82f6;
  color: #fff;
  border-radius: 10px;
  padding: 0 5px;
  line-height: 15px;
}
.dev-widget .tab-count--dim {
  background: var(--w-tab-count-bg);
  color: var(--w-tab-count-text);
}
.dev-widget .tab-count--unread {
  background: #3b82f6;
  color: #fff;
}

.dev-widget .panel-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.dev-widget .panel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--w-text-btn);
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  padding: 0;
  font-size: 11px;
}
.dev-widget .panel-btn:hover {
  color: var(--w-text-btn-hover);
  background: var(--w-bg-btn-hover);
}
.dev-widget .panel-btn.is-paused {
  color: #f59e0b;
}
.dev-widget .panel-btn.is-paused:hover {
  color: #d97706;
  background: var(--w-bg-btn-hover);
}
.dev-widget .panel-btn--close:hover {
  color: #ef4444;
}

.dev-widget .panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--w-scrollbar) transparent;
  min-height: 0;
}
.dev-widget .panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 36px 0;
  color: var(--w-text-muted);
  font-size: 11px;
}
.dev-widget .panel-empty-icon {
  font-size: 22px;
  opacity: 0.35;
}
.dev-widget .panel-error {
  padding: 10px 12px;
  background: var(--w-bg-err);
  border: 1px solid var(--w-border-err);
  border-radius: 6px;
  color: var(--w-text-err);
  font-size: 11px;
}

.dev-widget .panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-top: 1px solid var(--w-border);
  background: var(--w-bg-raised);
  font-size: 10px;
  color: var(--w-text-muted);
  flex-shrink: 0;
  gap: 8px;
}
.dev-widget .footer-info {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dev-widget .footer-slow-btn {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--w-border);
  background: transparent;
  color: var(--w-text-secondary);
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 10px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.dev-widget .footer-slow-btn:hover:not(:disabled) {
  color: var(--w-text-btn-hover);
  background: var(--w-bg-btn-hover);
}
.dev-widget .footer-slow-btn--running {
  color: #d97706;
  border-color: #fcd34d;
  cursor: default;
}
.dark .dev-widget .footer-slow-btn--running {
  color: #f59e0b;
  border-color: #78350f;
}

.dev-widget .query-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.dev-widget .query-item {
  background: var(--w-bg-item);
  border: 1px solid var(--w-border-item);
  border-radius: 6px;
  overflow: hidden;
}
.dev-widget .query-item--waiting {
  border-color: var(--w-border-wait);
  background: var(--w-bg-wait);
}
.dev-widget .query-item--error {
  border-color: var(--w-border-err);
  background: var(--w-bg-err);
}
.dev-widget .query-item--new {
  animation: dw-flash-new 1s ease-out forwards;
}

@keyframes dw-flash-new {
  0% {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  }
  100% {
    background: var(--w-bg-item);
    border-color: var(--w-border-item);
  }
}
.dark .dev-widget .query-item--new {
  animation: dw-flash-new-dark 1s ease-out forwards;
}
@keyframes dw-flash-new-dark {
  0% {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.35);
  }
  100% {
    background: var(--w-bg-item);
    border-color: var(--w-border-item);
  }
}

.dev-widget .query-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: var(--w-bg-item-meta);
  border-bottom: 1px solid var(--w-border-item);
  font-size: 10px;
}
.dev-widget .meta-pid,
.dev-widget .meta-time {
  color: var(--w-text-secondary);
  font-variant-numeric: tabular-nums;
}
.dev-widget .meta-duration {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.dev-widget .duration-fast {
  color: #16a34a;
}
.dev-widget .duration-medium {
  color: #d97706;
}
.dev-widget .duration-slow {
  color: #dc2626;
}
.dark .dev-widget .duration-fast {
  color: #22c55e;
}
.dark .dev-widget .duration-medium {
  color: #f59e0b;
}
.dark .dev-widget .duration-slow {
  color: #ef4444;
}

.dev-widget .meta-context {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border-radius: 3px;
  padding: 1px 5px;
}
.dark .dev-widget .meta-context {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}
.dev-widget .meta-wait {
  margin-left: auto;
  color: var(--w-text-wait);
  font-size: 10px;
}
.dev-widget .meta-error-badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #fecaca;
  color: #991b1b;
  border-radius: 3px;
  padding: 1px 5px;
}
.dark .dev-widget .meta-error-badge {
  background: #7f1d1d;
  color: #fca5a5;
}

.dev-widget .query-error-msg {
  padding: 6px 10px;
  font-size: 10px;
  color: var(--w-text-err-msg);
  background: var(--w-bg-err);
  border-bottom: 1px solid var(--w-border-err);
  white-space: pre-wrap;
  word-break: break-all;
}
.dev-widget .query-sql {
  font-size: 11px;
}
.dev-widget .query-sql--pre {
  margin: 0;
  padding: 6px 10px;
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--w-sql);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--w-scrollbar) transparent;
}

.dev-widget .history-groups {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dev-widget .history-group {
  border: 1px solid var(--w-border);
  border-radius: 6px;
  overflow: hidden;
}
.dev-widget .group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  background: var(--w-bg-raised);
  color: var(--w-text-secondary);
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s, background 0.15s;
}
.dev-widget .group-header:hover {
  color: var(--w-text);
  background: var(--w-bg-btn-hover);
}
.dev-widget .group-header--unread {
  color: var(--w-text);
}

.dev-widget .group-chevron {
  flex-shrink: 0;
  opacity: 0.5;
  font-size: 10px;
  transform: rotate(-90deg);
  transition: transform 0.18s ease;
}
.dev-widget .group-chevron--open {
  transform: rotate(0deg);
}
.dev-widget .group-label {
  flex: 1;
}
.dev-widget .group-unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.6);
}
.dev-widget .history-group .query-list {
  border-top: 1px solid var(--w-border);
  padding: 5px;
}
</style>
