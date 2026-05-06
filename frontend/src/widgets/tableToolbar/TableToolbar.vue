<template>
  <div class="table-toolbar">
    <div class="toolbar-search">
      <InputGroup unstyled class="search-input-group">
        <InputGroupAddon>
          <i
            class="pi"
            :class="
              searchError
                ? 'pi-exclamation-circle search-icon-error'
                : 'pi-search'
            "
          />
        </InputGroupAddon>
        <InputText
          :model-value="search"
          unstyled
          placeholder="Search... or : col op value"
          class="rounded-r-lg"
          @update:model-value="$emit('update:search', $event)"
          @keydown="handleKeyDown"
          @focus="inputFocused = true"
          @blur="inputFocused = false"
        />
      </InputGroup>
      <p v-if="searchError" class="search-error-text">{{ searchError }}</p>
      <ul v-if="showSuggestions" class="search-suggestions">
        <li
          v-for="(s, i) in filteredSuggestions"
          :key="s"
          :class="{ 'is-active': i === hoveredIdx }"
          @mousedown.prevent="applySuggestion(s)"
        >
          {{ s }}
        </li>
      </ul>
    </div>

    <slot />

    <div class="toolbar-actions">
      <Tooltip text="Columns">
        <ColumnSelector
          :model-value="columns"
          :options="columnOptions"
          placeholder="Select columns"
          minimal
          @update:model-value="$emit('update:columns', $event)"
        />
      </Tooltip>
      <Tooltip :text="showFilters ? 'Hide filters' : 'Show filters'">
        <Button
          :icon="showFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
          :severity="showFilters ? 'primary' : 'secondary'"
          text
          rounded
          class="filter-toggle-btn"
          @click="toggleFilters"
        />
      </Tooltip>
      <Transition name="clear-btn">
        <span v-if="hasActiveFilters" class="clear-btn-wrap">
          <Tooltip text="Clear filters">
            <button class="toolbar-icon-btn" @click="$emit('clear-filters')">
              <i class="pi pi-times-circle" />
            </button>
          </Tooltip>
        </span>
      </Transition>
      <TableExportMenu
        :table-ref="tableRef"
        :rows="rows"
        :filename="filename"
      />
      <Tooltip :text="fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'">
        <button
          class="toolbar-icon-btn"
          @click="$emit('update:fullscreen', !fullscreen)"
        >
          <SvgIcon
            type="mdi"
            :path="fullscreen ? mdiFullscreenExit : mdiFullscreen"
            class="toolbar-icon"
          />
        </button>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Button from "primevue/button";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import ColumnSelector from "@/shared/ui/columnSelector";
import TableExportMenu from "@/shared/ui/tableExportMenu";
import Tooltip from "@/shared/ui/tooltip";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreen, mdiFullscreenExit } from "@mdi/js";

interface Props {
  search: string;
  columns: (string | number)[];
  columnOptions: Array<{ label: string; key: string }>;
  showFilters: boolean;
  hasActiveFilters?: boolean;
  tableRef: { $el?: HTMLElement } | null;
  rows?: Record<string, unknown>[];
  filename?: string;
  fullscreen?: boolean;
  searchError?: string | null;
  searchSuggestions?: string[];
  searchValueMap?: Record<string, string[]>;
}

const props = withDefaults(defineProps<Props>(), {
  rows: undefined,
  filename: "export",
  fullscreen: false,
  hasActiveFilters: false,
  searchError: null,
  searchSuggestions: () => [],
  searchValueMap: () => ({}),
});

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:columns", value: (string | number)[]): void;
  (e: "update:showFilters", value: boolean): void;
  (e: "update:fullscreen", value: boolean): void;
  (e: "clear-filters"): void;
}>();

function toggleFilters() {
  if (props.showFilters) emit("clear-filters");
  emit("update:showFilters", !props.showFilters);
}

const inputFocused = ref(false);
const hoveredIdx = ref(-1);

type SearchContext =
  | { type: "key"; partial: string }
  | { type: "operator"; key: string; partial: string }
  | { type: "value"; key: string; op: string; partial: string }
  | null;

const KEY_OP_VALUE_RE =
  /^([a-zA-Z_][a-zA-Z0-9_.]*)\s+(<=|>=|!=|contains|<|>|=)\s*([\s\S]*)/i;
const KEY_OP_PARTIAL_RE = /^([a-zA-Z_][a-zA-Z0-9_.]*)\s+([\s\S]*)/;
const OPERATORS = ["=", "!=", "<", "<=", ">", ">=", "contains"];

const searchContext = computed<SearchContext>(() => {
  const q = props.search.trim();
  if (!q.startsWith(":")) return null;
  const raw = q.slice(1).trimStart();
  const parts = raw.split(/\s+(?:and|or)\s+/i);
  const last = parts[parts.length - 1].trimStart();

  const kvMatch = last.match(KEY_OP_VALUE_RE);
  if (kvMatch)
    return {
      type: "value",
      key: kvMatch[1],
      op: kvMatch[2].toLowerCase(),
      partial: kvMatch[3],
    };

  const koMatch = last.match(KEY_OP_PARTIAL_RE);
  if (koMatch)
    return { type: "operator", key: koMatch[1], partial: koMatch[2] };

  return { type: "key", partial: last.trim() };
});

const filteredSuggestions = computed(() => {
  const ctx = searchContext.value;
  if (!ctx) return [];

  if (ctx.type === "key") {
    if (!props.searchSuggestions.length) return [];
    const lower = ctx.partial.toLowerCase();
    const list =
      lower === ""
        ? props.searchSuggestions
        : props.searchSuggestions.filter((s) =>
            s.toLowerCase().startsWith(lower)
          );
    return list.slice(0, 10);
  }

  if (ctx.type === "operator") {
    const lower = ctx.partial.toLowerCase();
    return lower === ""
      ? OPERATORS
      : OPERATORS.filter((op) => op.startsWith(lower));
  }

  if (ctx.type === "value") {
    const vals = props.searchValueMap[ctx.key] ?? [];
    if (!vals.length) return [];
    const lower = ctx.partial.toLowerCase();
    const list =
      lower === ""
        ? vals
        : vals.filter((v) => v.toLowerCase().startsWith(lower));
    return list.slice(0, 10);
  }

  return [];
});

const showSuggestions = computed(
  () => inputFocused.value && filteredSuggestions.value.length > 0
);

watch(
  () => props.search,
  () => {
    hoveredIdx.value = -1;
  }
);

function applySuggestion(s: string) {
  const ctx = searchContext.value;
  if (!ctx) return;
  const base = props.search.trimEnd();
  const partial = ctx.partial;
  let newVal: string;
  if (partial === "") {
    newVal = base + " " + s + " ";
  } else if (base.toLowerCase().endsWith(partial.toLowerCase())) {
    newVal = base.slice(0, base.length - partial.length) + s + " ";
  } else {
    newVal = base + " " + s + " ";
  }
  emit("update:search", newVal);
  hoveredIdx.value = -1;
}

function handleKeyDown(e: KeyboardEvent) {
  if (!showSuggestions.value) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    hoveredIdx.value = Math.min(
      hoveredIdx.value + 1,
      filteredSuggestions.value.length - 1
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    hoveredIdx.value = Math.max(hoveredIdx.value - 1, -1);
  } else if (e.key === "Tab") {
    const idx = hoveredIdx.value >= 0 ? hoveredIdx.value : 0;
    e.preventDefault();
    applySuggestion(filteredSuggestions.value[idx]);
  } else if (e.key === "Enter" && hoveredIdx.value >= 0) {
    e.preventDefault();
    applySuggestion(filteredSuggestions.value[hoveredIdx.value]);
  } else if (e.key === "Escape") {
    inputFocused.value = false;
  }
}
</script>

<style scoped>
.table-toolbar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.toolbar-search {
  flex: 1 1 200px;
  min-width: 160px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}

.search-input-group {
  width: 100%;
}

.search-icon-error {
  color: #ef4444;
}

.search-error-text {
  margin: 0;
  padding: 0 0.5rem;
  font-size: 0.7rem;
  color: #ef4444;
  line-height: 1.2;
}

.search-suggestions {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  box-shadow: var(--shadow-active);
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  z-index: 50;
  max-height: 220px;
  overflow-y: auto;
}

.search-suggestions li {
  padding: 0.3rem 0.75rem;
  font-size: 0.78rem;
  font-family: monospace;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text);
}

.search-suggestions li:hover,
.search-suggestions li.is-active {
  background: rgba(var(--primary-400), 0.12);
  color: var(--color-interactive-hover);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  padding-left: 0.625rem;
  border-left: 1.5px solid var(--color-border);
}

.filter-toggle-btn {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1rem;
}

.clear-btn-wrap {
  display: inline-flex;
  align-items: center;
  transform-origin: left center;
  max-width: 2.5rem;
  overflow: visible;
}

.clear-btn-enter-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease, max-width 0.22s ease;
}

.clear-btn-leave-active {
  transition: transform 0.18s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease-in,
    max-width 0.2s ease-in;
}

.clear-btn-enter-from,
.clear-btn-leave-to {
  transform: scale(0);
  opacity: 0;
  max-width: 0;
}

.toolbar-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.toolbar-icon-btn:hover {
  background: var(--color-active-bg);
  color: var(--color-interactive-hover);
}

.toolbar-icon {
  width: 1.7rem;
  height: 1.7rem;
}
</style>
