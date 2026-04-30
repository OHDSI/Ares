<template>
  <div class="pivot-wrapper" v-if="data">
    <div class="pivot-controls section">
      <div class="panel-toggle">
        <button :class="['panel-btn', { active: activePanel === 0 }]" @click="activePanel = 0">Table</button>
        <button :class="['panel-btn', { active: activePanel === 1 }]" @click="activePanel = 1">Settings</button>
      </div>

      <div v-if="activePanel === 0" class="attr-panels">
        <div class="attr-panel">
          <label class="field-label">Row attributes</label>
          <MultiSelect
            v-model="selectedRows"
            :options="getDisplayedAttributes"
            class="w-full"
          >
            <template #value>Add rows…</template>
          </MultiSelect>
          <draggable
            v-if="selectedRows.length"
            class="attr-list"
            item-key="id"
            v-model="selectedRows"
          >
            <template #item="{ element }">
              <div class="attr-item">
                <i class="pi pi-bars drag-handle" />
                <span class="attr-name">{{ element }}</span>
                <button class="remove-btn" @click="removeRows(element)">
                  <i class="pi pi-times" />
                </button>
              </div>
            </template>
          </draggable>
          <p class="empty-state attr-empty" v-else>No rows selected.</p>
        </div>

        <div class="divider" />

        <div class="attr-panel">
          <label class="field-label">Column attributes</label>
          <MultiSelect
            v-model="selectedCols"
            :options="getDisplayedAttributes"
            class="w-full"
          >
            <template #value>Add columns…</template>
          </MultiSelect>
          <draggable
            v-if="selectedCols.length"
            class="attr-list"
            item-key="id"
            v-model="selectedCols"
          >
            <template #item="{ element }">
              <div class="attr-item">
                <i class="pi pi-bars drag-handle" />
                <span class="attr-name">{{ element }}</span>
                <button class="remove-btn" @click="removeCols(element)">
                  <i class="pi pi-times" />
                </button>
              </div>
            </template>
          </draggable>
          <p class="empty-state attr-empty" v-else>No columns selected.</p>
        </div>
      </div>

      <div v-if="activePanel === 1" class="settings-panel">
        <div class="filter-list">
          <div v-for="attr in getDisplayedAttributes" :key="attr" class="filter-item">
            <label class="field-label">{{ attr }}</label>
            <MultiSelect
              v-model="selectedFilters[attr]"
              :options="getUniqueAttributeValues[attr]"
              :placeholder="`Filter…`"
              :virtualScrollerOptions="{ itemSize: 20 }"
              class="w-full"
            />
          </div>
        </div>

        <div class="divider" />

        <div>
          <label class="field-label">Aggregate function</label>
          <Dropdown
            v-model="aggregateFunction"
            :options="aggregatorNamesList"
            placeholder="Select function"
            class="w-full"
          />
        </div>

        <div v-if="aggregateFunction === 'Sum'" style="margin-top: 0.75rem">
          <label class="field-label">Aggregate value</label>
          <Dropdown
            v-model="aggregateValue[0]"
            :options="getAggregateValues"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div class="pivot-output">
      <div v-if="selectedCols.length || selectedRows.length" class="table-container">
        <VuePivottable
          :data="data"
          :rows="selectedRows"
          :cols="selectedCols"
          :aggregators="aggregators"
          :attributes="getDisplayedAttributes"
          :value-filter="getParsedFiltersForPivotTable"
          :aggregator-name="aggregateFunction"
          :vals="aggregateValue"
          :table-options="eventListener ? eventListener(router, route, getUniqueAttributeValues) : {}"
        />
      </div>
      <div class="empty-state pivot-empty" v-else>
        Select at least one row or column attribute to display results.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VuePivottable } from "vue-pivottable";
import "./vue-pivottable.scss";
import { computed, Ref, ref, onBeforeMount } from "vue";
import { useStore } from "vuex";
import draggable from "vuedraggable";

import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";

import {
  useRouter,
  useRoute,
  Router,
  RouteLocationNormalizedLoaded,
} from "vue-router";

const router = useRouter();
const route = useRoute();
const store = useStore();

const darkMode = computed(() => store.getters.getSettings.darkMode);

const sectionBg = computed(() => (darkMode.value ? "#212121" : "#ffffff"));
const sectionBorder = computed(() => (darkMode.value ? "#3a3a3a" : "#94a3b8"));
const bodyColor = computed(() => (darkMode.value ? "#f1f5f9" : "#334155"));
const mutedColor = computed(() => (darkMode.value ? "#9ca3af" : "#94a3b8"));
const dividerBg = computed(() => (darkMode.value ? "#4b5563" : "#cbd5e1"));
const btnColor = computed(() => (darkMode.value ? "#9ca3af" : "#64748b"));
const btnHoverColor = computed(() => (darkMode.value ? "#e2e8f0" : "#334155"));
const activeBg = computed(() => (darkMode.value ? "rgba(255,255,255,0.1)" : "#ffffff"));
const activeShadow = computed(() =>
  darkMode.value ? "0 1px 4px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.08)"
);
const attrItemBg = computed(() => (darkMode.value ? "rgba(255,255,255,0.06)" : "#f8fafc"));
const attrItemBorder = computed(() => (darkMode.value ? "#3a3a3a" : "#e2e8f0"));
const removeColor = computed(() => (darkMode.value ? "#6b7280" : "#94a3b8"));
const removeHoverColor = computed(() => (darkMode.value ? "#f87171" : "#ef4444"));
const dragHandleColor = computed(() => (darkMode.value ? "#4b5563" : "#cbd5e1"));

const activePanel = ref(0);
const selectedFilters = ref({});

interface Props {
  data: object[];
  attributes?: string[];
  aggregatorNamesList?: string[];
  aggregators?: object;
  aggregateAttrs?: string[];
  defaults?: {
    rows?: string[];
    columns?: string[];
    aggregateValue?: string[];
    aggregateFunction?: string;
  };
  aggregateFunction?: string;
  eventListener?: (
    a: Router,
    b: RouteLocationNormalizedLoaded,
    c: string[]
  ) => {
    clickCallBack: (e: any, value: any, axisAttributes: any, pivotData: any) => void;
  };
}

const props = defineProps<Props>();

const getDisplayedAttributes = computed(() => props.attributes);

const getParsedFiltersForPivotTable = computed(() =>
  Object.fromEntries(
    Object.entries(selectedFilters.value)
      .filter(([, values]) => (values as string[]).length > 0)
      .map(([key, values]) => [
        key,
        Object.fromEntries(
          getUniqueAttributeValues.value[key]
            .filter((value) => !(values as string[]).includes(value))
            .map((value) => [value, true])
        ),
      ])
  )
);

const getAggregateValues = computed(() =>
  props.aggregateAttrs ? props.aggregateAttrs : getDisplayedAttributes.value
);

const getUniqueAttributeValues = computed(() =>
  getDisplayedAttributes.value.reduce(
    (acc, attr) => ({
      ...acc,
      [attr]: [...new Set(props.data.map((d) => d[attr]))],
    }),
    {} as Record<string, string[]>
  )
);

const selectedRows: Ref<string[]> = ref([]);
const removeRows = (item: string) => {
  selectedRows.value = selectedRows.value.filter((v) => v !== item);
};

const selectedCols: Ref<string[]> = ref([]);
const removeCols = (item: string) => {
  selectedCols.value = selectedCols.value.filter((v) => v !== item);
};

const aggregateFunction: Ref<string> = ref("");
const aggregateValue: Ref<string[]> = ref([""]);

onBeforeMount(() => {
  selectedRows.value = props.defaults?.rows ?? [];
  selectedCols.value = props.defaults?.columns ?? [];
  aggregateFunction.value = props.defaults?.aggregateFunction ?? props.aggregatorNamesList?.[0] ?? "";
  aggregateValue.value = props.defaults?.aggregateValue ?? [getAggregateValues.value?.[0] ?? ""];
});
</script>

<style scoped>
.pivot-wrapper {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.75rem;
  width: 100%;
  min-height: 500px;
}

.pivot-controls {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: v-bind(bodyColor);
  background: v-bind(sectionBg);
  border: 1.5px solid v-bind(sectionBorder);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.panel-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 6px;
}

.panel-btn {
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: v-bind(btnColor);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.panel-btn:hover {
  color: v-bind(btnHoverColor);
}

.panel-btn.active {
  color: v-bind(btnHoverColor);
  font-weight: 600;
  background: v-bind(activeBg);
  box-shadow: v-bind(activeShadow);
}

.attr-panels {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attr-panel {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.attr-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.125rem;
}

.attr-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  background: v-bind(attrItemBg);
  border: 1px solid v-bind(attrItemBorder);
  border-radius: 4px;
  cursor: move;
}

.drag-handle {
  font-size: 0.75rem;
  color: v-bind(dragHandleColor);
  flex-shrink: 0;
}

.attr-name {
  flex: 1;
  font-size: 0.8125rem;
  color: v-bind(bodyColor);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: v-bind(removeColor);
  font-size: 0.6875rem;
  line-height: 1;
  display: flex;
  align-items: center;
  transition: color 0.12s;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: v-bind(removeHoverColor);
}

.attr-empty {
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  text-align: left;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.divider {
  height: 1px;
  background: v-bind(dividerBg);
  margin: 0.25rem 0;
}

.pivot-output {
  flex: 1;
  min-width: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: v-bind(sectionBg);
  border: 1.5px solid v-bind(sectionBorder);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.table-container {
  width: 100%;
}

.pivot-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  text-align: center;
  font-size: 0.9375rem;
  color: v-bind(mutedColor);
}

.empty-state {
  color: v-bind(mutedColor);
}
</style>
