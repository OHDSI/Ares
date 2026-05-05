<template>
  <div class="table-toolbar">
    <InputGroup unstyled class="toolbar-search">
      <InputGroupAddon>
        <i class="pi pi-search" />
      </InputGroupAddon>
      <InputText
        :model-value="search"
        unstyled
        placeholder="Search..."
        class="rounded-r-lg"
        @update:model-value="$emit('update:search', $event)"
      />
    </InputGroup>

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
          @click="$emit('update:showFilters', !showFilters)"
        />
      </Tooltip>
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
  tableRef: { $el?: HTMLElement } | null;
  rows?: Record<string, unknown>[];
  filename?: string;
  fullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  rows: undefined,
  filename: "export",
  fullscreen: false,
});

defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:columns", value: (string | number)[]): void;
  (e: "update:showFilters", value: boolean): void;
  (e: "update:fullscreen", value: boolean): void;
}>();
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
