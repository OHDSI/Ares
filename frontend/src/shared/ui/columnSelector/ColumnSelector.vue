<template>
  <div
    :class="wrapperClass"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      v-if="compact || minimal"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      :class="
        compact
          ? [
              'rounded-md border border-surface-300 bg-white transition-opacity duration-300 ease-out dark:border-surface-500 dark:bg-surface-800',
              isExpanded ? 'opacity-0' : '',
            ]
          : 'rounded-full'
      "
    >
      <svg-icon
        type="mdi"
        :path="mdiTable"
        class="h-5 w-5 text-surface-500 dark:text-white/60"
      />
    </div>
    <MultiSelect
      :model-value="modelValue"
      :options="options"
      option-label="label"
      option-value="key"
      :placeholder="placeholder"
      display="chip"
      :filter="true"
      :pt="pt"
      class="w-full"
      @update:modelValue="$emit('update:modelValue', $event)"
      @show="isOpen = true"
      @hide="isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import MultiSelect from "primevue/multiselect";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiTable } from "@mdi/js";

interface Props {
  modelValue: (string | number)[];
  options: Array<{ label: string; key: string }>;
  placeholder?: string;
  compact?: boolean;
  minimal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "All columns",
  compact: false,
  minimal: false,
});

defineEmits<{ (e: "update:modelValue", value: (string | number)[]): void }>();

const isHovered = ref(false);
const isOpen = ref(false);
const isExpanded = computed(() => isHovered.value || isOpen.value);

let collapseTimer: ReturnType<typeof setTimeout> | null = null;

function onMouseEnter() {
  if (!props.compact) return;
  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }
  isHovered.value = true;
}

function onMouseLeave() {
  if (!props.compact) return;
  collapseTimer = setTimeout(() => {
    isHovered.value = false;
    collapseTimer = null;
  }, 400);
}

const wrapperClass = computed(() => {
  if (props.minimal) {
    return "relative w-[2.25rem] h-[2.25rem] overflow-hidden";
  }
  if (props.compact) {
    return [
      "transition-[max-width] duration-300 ease-in-out will-change-[max-width]",
      "group relative flex-1 h-[42px] overflow-hidden",
      isExpanded.value ? "max-w-[600px]" : "max-w-[42px]",
    ].join(" ");
  }
  return "transition-[max-width] duration-300 ease-in-out will-change-[max-width]";
});

const pt = computed(() => {
  if (props.minimal) {
    return {
      root: {
        class: [
          "relative cursor-pointer w-full h-full rounded-full border-0",
          "bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700",
          "transition-colors duration-150",
        ].join(" "),
      },
      labelContainer: { class: "hidden" },
      label: { class: "hidden" },
      trigger: { class: "hidden" },
    };
  }

  return {
    root: {
      class: [
        "inline-flex relative cursor-pointer select-none w-full",
        "rounded-md transition-all duration-200",
        "bg-white dark:bg-surface-800 shadow-sm",
        "border border-surface-300 dark:border-surface-500",
        "hover:border-primary-400 dark:hover:border-primary-300",
        props.compact ? "h-full overflow-hidden" : "",
      ].join(" "),
    },
    labelContainer: {
      class: props.compact
        ? "overflow-x-auto flex flex-auto cursor-pointer"
        : "overflow-hidden flex flex-auto cursor-pointer",
      style: props.compact
        ? "scrollbar-width: none; -ms-overflow-style: none;"
        : "",
    },
    label: {
      class: [
        "flex items-center text-sm text-surface-700 dark:text-white/80",
        props.compact
          ? "flex-nowrap gap-1 px-2 !py-0 h-full"
          : "flex-wrap gap-1 py-1.5 px-2.5 min-h-[2rem]",
      ].join(" "),
    },
    token: {
      class: [
        "inline-flex items-center gap-1 shrink-0",
        "px-2 py-0.5 rounded text-xs font-medium bg-transparent",
        "text-primary-600 dark:text-primary-300",
        "border border-primary-300 dark:border-primary-400",
      ].join(" "),
    },
    removeTokenIcon: { class: "w-3 h-3 ml-0.5 opacity-50 hover:opacity-100" },
    trigger: { class: "hidden" },
  };
});
</script>
