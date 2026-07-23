<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-row gap-5">
      <InputGroup class="flex-grow" unstyled>
        <InputGroupAddon>
          <i class="pi pi-search"></i>
        </InputGroupAddon>
        <InputText
          class="rounded-r-lg"
          unstyled
          v-model="search"
          placeholder="Search in Table"
        />
      </InputGroup>
    </div>
    <div ref="tableContainer" class="overflow-x-scroll table-container">
      <table>
        <thead>
          <tr>
            <th
              class="rowNameCol cursor-pointer"
              :class="{
                scrolled: isScrolled,
                'frozen-edge': isScrolled && !referenceKey,
              }"
              rowspan="2"
              @click="handleSort('rowHeader')"
            >
              <div class="flex items-center gap-2">
                {{ panel.rowHeader.name }}
                <span
                  v-if="sortConfig.field === 'rowHeader'"
                  class="sort-indicator active"
                >
                  {{ sortConfig.direction === "asc" ? "▲" : "▼" }}
                </span>
                <span v-else class="sort-indicator inactive">⇅</span>
              </div>
            </th>
            <th
              class="sourceGroup"
              :class="{
                'reference-border-x reference-header reference-frozen':
                  source === referenceKey,
                scrolled: isScrolled && source === referenceKey,
                'frozen-edge': isScrolled && source === referenceKey,
              }"
              :style="
                source === referenceKey
                  ? { left: `${referenceColOffsets[0] ?? 100}px` }
                  : undefined
              "
              v-for="source in sources"
              :colspan="getDisplayColumns(source).length"
              :key="source"
            >
              <router-link
                class="text-blue-400 hover:underline"
                :to="getIndexTableRoute(source)"
                >{{ source }}
              </router-link>
              <span
                v-if="source === referenceKey"
                class="ml-1 text-xs font-medium text-blue-500 dark:text-blue-400"
                >(reference)</span
              >
            </th>
          </tr>
          <tr>
            <template v-for="source in sources" :key="source">
              <th
                class="text-right sourceGroup"
                :class="{
                  'cursor-pointer': col.sortable,
                  'reference-border-l':
                    colIndex === 0 && source === referenceKey,
                  'reference-border-r':
                    colIndex === getDisplayColumns(source).length - 1 &&
                    source === referenceKey,
                  'reference-frozen': source === referenceKey,
                  scrolled: isScrolled && source === referenceKey,
                  'frozen-edge':
                    isScrolled &&
                    source === referenceKey &&
                    colIndex === getDisplayColumns(source).length - 1,
                }"
                :style="
                  source === referenceKey
                    ? { left: `${referenceColOffsets[colIndex] ?? 100}px` }
                    : undefined
                "
                :data-source="source"
                v-for="(col, colIndex) in getDisplayColumns(source)"
                :key="col.key"
                @click="col.sortable ? handleSort(col.key, source) : null"
              >
                <div class="flex items-center justify-end gap-2">
                  {{ col.label }}
                  <span
                    v-if="
                      col.sortable &&
                      sortConfig.field === col.key &&
                      sortConfig.source === source
                    "
                    class="sort-indicator active"
                  >
                    {{ sortConfig.direction === "asc" ? "▲" : "▼" }}
                  </span>
                  <span
                    v-else-if="col.sortable"
                    class="sort-indicator inactive"
                  >
                    ⇅
                  </span>
                </div>
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(rowName, index) in slicedArray"
            :key="rowName"
            :class="
              !(index % 2) && stripedRows
                ? 'dark:bg-surface-650 bg-surface-50'
                : ''
            "
          >
            <td
              :class="{
                scrolled: isScrolled,
                'frozen-edge': isScrolled && !referenceKey,
              }"
              class="rowNameCol"
            >
              <a
                v-if="panel.showDrillDown"
                class="cursor-pointer"
                @click="$emit('drilldown', rowName)"
              >
                {{ rowName[panel.rowHeader.value] }}
              </a>
              <span v-else>
                {{ rowName[panel.rowHeader.value] }}
              </span>
            </td>
            <template v-for="source in sources" :key="source">
              <td
                :class="`text-right ${cell.className} ${borderClass(
                  source,
                  index,
                  getDisplayColumns(source).length,
                )} ${
                  source === referenceKey
                    ? `reference-frozen ${isScrolled ? 'scrolled' : ''} ${
                        isScrolled &&
                        index === getDisplayColumns(source).length - 1
                          ? 'frozen-edge'
                          : ''
                      }`
                    : ''
                }`"
                :style="
                  source === referenceKey
                    ? { left: `${referenceColOffsets[index] ?? 100}px` }
                    : undefined
                "
                v-for="(cell, index) in getRowCells(source, rowName)"
                :key="cell.key"
              >
                <router-link
                  v-if="cell.link && cell.rowId"
                  class="text-blue-400 hover:underline"
                  :to="getDrilldownRoute(source, cell.rowId)"
                  >{{ cell.display }}
                </router-link>
                <span v-else>
                  {{ cell.display }}
                </span>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <Paginator
      v-model:first="first"
      :rows="step"
      :totalRecords="sortedAndFilteredResults.length"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
    />
  </div>
</template>

<script setup lang="ts">
import Paginator from "primevue/paginator";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import type { ComparisonTablePanel } from "@/processes/exploreReports/config/viewRegistry";
import {
  computeDelta,
  deltaColor,
  formatDelta,
  formatDeltaPercent,
  formatDeltaPoints,
} from "./lib/delta";
import { getByPath } from "./lib/getByPath";

const props = defineProps<{
  panel: ComparisonTablePanel;
  dataSources: Record<string, any>;
  sources: string[];
  referenceKey: string | null;
  getDrilldownRoute: (source: string, rowId: string | number) => any;
  getIndexTableRoute: (source: string) => any;
}>();

defineEmits<{ drilldown: [rowName: any] }>();

const store = useStore();
const stripedRows = computed(() => store.getters.getSettings.strippedRows);

const search = ref(null);
const first = ref(0);
const step = ref(10);
const sortConfig = ref({ field: null, direction: "asc", source: null });

const rowKeyField = computed(
  () => props.panel.rowKey || props.panel.rowHeader.value,
);

function getRows(source: string): any[] {
  return (
    (getByPath(props.dataSources[source], props.panel.sourceField) as any[]) ||
    []
  );
}

function borderClass(source: string, index: number, count: number): string {
  if (source === props.referenceKey) {
    const classes = [];
    if (index === 0) classes.push("reference-border-l");
    if (index === count - 1) classes.push("reference-border-r");
    return classes.join(" ");
  }
  return index === 0
    ? "border-l border-surface-100"
    : "border-r border-surface-100";
}

function getSourceData(source: string, rowName: any) {
  return (
    getRows(source).find(
      (item) => item[rowKeyField.value] === rowName[rowKeyField.value],
    ) || {}
  );
}

function getDisplayColumns(source: string) {
  const isReference = source === props.referenceKey;
  const metrics = props.panel.metrics;

  return metrics.flatMap((metric) => {
    const valueCol = {
      key: metric.value,
      label: metric.name,
      sortable: metric.sortable,
      kind: "value",
      metric,
    };

    if (isReference || !props.referenceKey || metric.type === "categorical") {
      return [valueCol];
    }

    if (metric.unit === "percent") {
      return [
        valueCol,
        {
          key: `${metric.value}__deltaPoints`,
          label: "Δ (pp)",
          sortable: metric.sortable,
          kind: "deltaPoints",
          metric,
        },
      ];
    }

    return [
      valueCol,
      {
        key: `${metric.value}__delta`,
        label: "Δ (Δ%)",
        sortable: metric.sortable,
        kind: "deltaCombined",
        metric,
      },
    ];
  });
}

function getRowCells(source: string, rowName: any) {
  const sourceData = getSourceData(source, rowName);
  const isReference = source === props.referenceKey;
  const referenceRow = props.referenceKey
    ? getSourceData(props.referenceKey, rowName)
    : null;

  return getDisplayColumns(source).map((col) => {
    if (col.kind === "value") {
      const rawValue = sourceData[col.metric.value];
      const display = rawValue
        ? col.metric.processingFunction
          ? col.metric.processingFunction(rawValue)
          : rawValue
        : "N/A";

      let className = "";
      if (col.metric.type === "categorical" && referenceRow && !isReference) {
        const differs = computeDelta(
          referenceRow,
          sourceData,
          col.metric,
        ).differs;
        className = differs ? "bg-yellow-100 dark:bg-yellow-900/40" : "";
      }

      return {
        key: col.key,
        display,
        className,
        rowId: sourceData[props.panel.rowId],
        link: col.metric.link,
      };
    }

    const delta = computeDelta(referenceRow, sourceData, col.metric);
    if (col.kind === "deltaPoints") {
      return {
        key: col.key,
        display: formatDeltaPoints(delta.deltaPoints),
        className: deltaColor(delta.deltaPoints),
      };
    }
    const deltaDisplay = formatDelta(
      delta.delta,
      col.metric.processingFunction,
    );
    const deltaPercentDisplay = formatDeltaPercent(delta.deltaPercent);
    return {
      key: col.key,
      display:
        deltaDisplay === "N/A" || deltaPercentDisplay === "N/A"
          ? deltaDisplay
          : `${deltaDisplay} (${deltaPercentDisplay})`,
      className: deltaColor(delta.deltaPercent),
    };
  });
}

function resolveSortValue(source: string, row: any, field: string) {
  const rowData = getSourceData(source, row);
  if (field.includes("__delta")) {
    const [metricValue, deltaKind] = field.split("__");
    const metric = props.panel.metrics.find((m) => m.value === metricValue);
    const referenceRow = props.referenceKey
      ? getSourceData(props.referenceKey, row)
      : null;
    const delta = computeDelta(referenceRow, rowData, metric);
    return delta[deltaKind];
  }
  return rowData[field];
}

const rowNames = computed(() => {
  const uniqueMap = new Map();
  props.sources
    .flatMap((source) => getRows(source))
    .forEach((item) => {
      const key = item[rowKeyField.value];
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
  return Array.from(uniqueMap.values());
});

const filteredResults = computed(() => {
  if (search.value && search.value.length) {
    return rowNames.value.filter((val) =>
      val[props.panel.rowHeader.value]
        .toLowerCase()
        .includes(search.value.toLowerCase()),
    );
  } else {
    return rowNames.value;
  }
});

const handleSort = (field: string, source: string | null = null) => {
  first.value = 0;

  if (field === "rowHeader") {
    if (
      sortConfig.value.field === "rowHeader" &&
      sortConfig.value.source === null
    ) {
      if (sortConfig.value.direction === "asc") {
        sortConfig.value.direction = "desc";
      } else if (sortConfig.value.direction === "desc") {
        sortConfig.value = { field: null, direction: "asc", source: null };
      }
    } else {
      sortConfig.value = { field: "rowHeader", direction: "asc", source: null };
    }
  } else {
    if (
      sortConfig.value.field === field &&
      sortConfig.value.source === source
    ) {
      if (sortConfig.value.direction === "asc") {
        sortConfig.value.direction = "desc";
      } else if (sortConfig.value.direction === "desc") {
        sortConfig.value = { field: null, direction: "asc", source: null };
      }
    } else {
      sortConfig.value = { field, direction: "asc", source };
    }
  }
};

const sortedAndFilteredResults = computed(() => {
  const results = [...filteredResults.value];

  if (sortConfig.value.field) {
    results.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.value.field === "rowHeader") {
        aValue = a[props.panel.rowHeader.value];
        bValue = b[props.panel.rowHeader.value];
      } else if (sortConfig.value.source) {
        aValue = resolveSortValue(
          sortConfig.value.source,
          a,
          sortConfig.value.field,
        );
        bValue = resolveSortValue(
          sortConfig.value.source,
          b,
          sortConfig.value.field,
        );
      }

      const aIsEmpty =
        aValue === null ||
        aValue === undefined ||
        aValue === "N/A" ||
        aValue === "";
      const bIsEmpty =
        bValue === null ||
        bValue === undefined ||
        bValue === "N/A" ||
        bValue === "";

      if (aIsEmpty && bIsEmpty) return 0;
      if (aIsEmpty) return 1;
      if (bIsEmpty) return -1;

      const aNum = Number(aValue);
      const bNum = Number(bValue);

      let comparison = 0;

      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.value.direction === "asc" ? comparison : -comparison;
    });
  }

  return results;
});

const slicedArray = computed(() => {
  const start = first.value;
  const end = start + step.value;
  return sortedAndFilteredResults.value.slice(start, end);
});

const tableContainer = ref(null);
const isScrolled = ref(false);

const handleScroll = () => {
  if (tableContainer.value) {
    isScrolled.value = tableContainer.value.scrollLeft > 0;
  }
};

onMounted(() => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener("scroll", handleScroll);
  }
});

watch(tableContainer, () => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener("scroll", handleScroll);
  }
});

onBeforeUnmount(() => {
  if (tableContainer.value) {
    tableContainer.value.removeEventListener("scroll", handleScroll);
  }
});

const referenceColOffsets = ref<number[]>([]);
let referenceResizeObserver: ResizeObserver | null = null;

function measureReferenceOffsets() {
  if (!tableContainer.value || !props.referenceKey) {
    referenceColOffsets.value = [];
    return;
  }

  const rowNameEl =
    tableContainer.value.querySelector<HTMLElement>(".rowNameCol");
  const rowNameWidth = rowNameEl?.getBoundingClientRect().width ?? 0;

  const refCells = Array.from(
    tableContainer.value.querySelectorAll<HTMLElement>(
      `thead tr:last-child th[data-source="${props.referenceKey}"]`,
    ),
  );

  const offsets: number[] = [];
  let running = rowNameWidth;
  refCells.forEach((el) => {
    offsets.push(running);
    running += el.getBoundingClientRect().width;
  });
  referenceColOffsets.value = offsets;
}

function setupReferenceObserver() {
  referenceResizeObserver?.disconnect();
  if (!tableContainer.value) return;

  referenceResizeObserver = new ResizeObserver(() => measureReferenceOffsets());
  const rowNameEl = tableContainer.value.querySelector(".rowNameCol");
  if (rowNameEl) referenceResizeObserver.observe(rowNameEl);

  if (props.referenceKey) {
    tableContainer.value
      .querySelectorAll(
        `thead tr:last-child th[data-source="${props.referenceKey}"]`,
      )
      .forEach((el) => referenceResizeObserver!.observe(el));
  }
}

onMounted(async () => {
  await nextTick();
  setupReferenceObserver();
  measureReferenceOffsets();
});

watch(
  () => [props.sources, props.referenceKey, props.panel],
  async () => {
    await nextTick();
    setupReferenceObserver();
    measureReferenceOffsets();
  },
);

onBeforeUnmount(() => {
  referenceResizeObserver?.disconnect();
});
</script>

<style scoped>
.sort-indicator {
  font-size: 1rem;
  transition: opacity 0.2s;
}

.sort-indicator.inactive {
  opacity: 0.5;
}

.sort-indicator.active {
  opacity: 0.8;
}

th.cursor-pointer:hover .sort-indicator.inactive {
  opacity: 0.9;
}

th.cursor-pointer:hover .sort-indicator.active {
  opacity: 1;
}

th.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark th.cursor-pointer:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

th {
  white-space: nowrap;
}

th > div {
  white-space: nowrap;
}

.rowNameCol {
  text-align: left;
  position: sticky;
  left: 0;
  min-width: 100px;
  z-index: 1;
  transition:
    background-color 0.15s linear,
    box-shadow 0.15s linear;
}
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 8px;
  @apply border dark:border-surface-700 border-surface-200;
}

th,
tr {
  @apply border-b dark:border-surface-700 border-surface-200;
}

.rowNameCol.scrolled {
  background-color: var(--color-border-subtle);
}

.frozen-edge {
  box-shadow: 4px 0 6px -4px rgba(0, 0, 0, 0.25);
}

.dark .frozen-edge {
  box-shadow: 4px 0 8px -4px rgba(0, 0, 0, 0.6);
}

.reference-frozen {
  position: sticky;
  z-index: 1;
  transition:
    background-color 0.15s linear,
    box-shadow 0.15s linear;
}

.reference-frozen.scrolled {
  background-color: var(--color-border-subtle);
}

.reference-border-l {
  border-left: 3px solid #3b82f6 !important;
}

.reference-border-r {
  border-right: 3px solid #3b82f6 !important;
}

.reference-border-x {
  border-left: 3px solid #3b82f6 !important;
  border-right: 3px solid #3b82f6 !important;
}

.dark .reference-border-l {
  border-left-color: #60a5fa !important;
}

.dark .reference-border-r {
  border-right-color: #60a5fa !important;
}

.dark .reference-border-x {
  border-left-color: #60a5fa !important;
  border-right-color: #60a5fa !important;
}

.reference-header {
  font-weight: 600;
}
</style>
