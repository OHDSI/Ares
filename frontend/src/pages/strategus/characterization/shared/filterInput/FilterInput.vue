<template>
  <div class="fi-wrap" @click.stop @keydown.stop>
    <select
      v-if="filterObj"
      v-model="localMode"
      class="fi-mode"
      title="Match mode"
      @change="onModeChange"
    >
      <option
        v-for="m in modes"
        :key="m.value"
        :value="m.value"
        :title="m.label"
      >
        {{ m.symbol }}
      </option>
    </select>
    <InputText
      v-model="localValue"
      :placeholder="placeholder"
      size="small"
      :style="inputStyle"
      class="fi-input"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import InputText from "primevue/inputtext";

interface FilterObj {
  value: string | null;
  matchMode: string;
}

const props = withDefaults(
  defineProps<{
    filterObj?: FilterObj | null;
    placeholder?: string;
    inputStyle?: string;
    type?: "text" | "numeric";
  }>(),
  {
    filterObj: null,
    placeholder: "Filter...",
    inputStyle: undefined,
    type: "text",
  }
);

const TEXT_MODES = [
  { value: "contains", symbol: "~", label: "Contains" },
  { value: "notContains", symbol: "!~", label: "Not contains" },
  { value: "startsWith", symbol: "^", label: "Starts with" },
  { value: "endsWith", symbol: "$", label: "Ends with" },
  { value: "equals", symbol: "=", label: "Equals" },
  { value: "notEquals", symbol: "≠", label: "Not equals" },
];

const NUMERIC_MODES = [
  { value: "equals", symbol: "=", label: "Equals" },
  { value: "notEquals", symbol: "≠", label: "Not equals" },
  { value: "lt", symbol: "<", label: "Less than" },
  { value: "lte", symbol: "≤", label: "Less or equal" },
  { value: "gt", symbol: ">", label: "Greater than" },
  { value: "gte", symbol: "≥", label: "Greater or equal" },
];

const modes = computed(() =>
  props.type === "numeric" ? NUMERIC_MODES : TEXT_MODES
);

function resolvedMode(): string {
  const modeList = props.type === "numeric" ? NUMERIC_MODES : TEXT_MODES;
  const cur = props.filterObj?.matchMode ?? "";
  return modeList.find((x) => x.value === cur)?.value ?? modeList[0].value;
}

const localValue = ref(props.filterObj?.value ?? "");
const localMode = ref(resolvedMode());

watch(
  () => props.filterObj?.value,
  (v) => {
    if (!v) localValue.value = "";
  }
);

watch(
  () => props.filterObj?.matchMode,
  (v) => {
    if (v && modes.value.find((m) => m.value === v)) {
      localMode.value = v;
    }
  }
);

watch(localValue, (v) => {
  if (!props.filterObj) return;
  props.filterObj.value = v || null;
});

function onModeChange() {
  if (props.filterObj) {
    props.filterObj.matchMode = localMode.value;
  }
}

onMounted(() => {
  if (props.filterObj) {
    const resolved = resolvedMode();
    if (resolved !== props.filterObj.matchMode) {
      props.filterObj.matchMode = resolved;
      localMode.value = resolved;
    }
  }
});
</script>

<style scoped>
.fi-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-width: 5rem;
}

.fi-mode {
  flex-shrink: 0;
  width: 1.9rem;
  height: 1.5rem;
  font-size: 0.8rem;
  font-family: monospace;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-bg-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  text-align: center;
  appearance: none;
  -webkit-appearance: none;
}

.fi-mode:hover {
  border-color: rgb(var(--primary-400));
  color: var(--color-text);
}

.fi-mode:focus {
  outline: none;
  border-color: rgb(var(--primary-400));
}

.fi-input {
  flex: 1;
  min-width: 0;
}

:deep(.fi-input.p-inputtext) {
  padding: 0.2rem 0.4rem;
  font-size: 0.72rem;
  height: 1.5rem;
}
</style>
