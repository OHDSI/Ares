<template>
  <div ref="el" :style="{ width: '100%', height }"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import darkTheme from "@/widgets/echarts/themes/dark-theme.json";
import lightTheme from "@/widgets/echarts/themes/light-theme.json";
import { PALETTE } from "@/shared/lib/chartColors";

interface Props {
  option: Record<string, any>;
  height?: string;
  /** map to register before the option is applied */
  map?: { name: string; geoJson: any } | null;
  /** change to discard the user's pan/zoom */
  resetKey?: number;
}

const props = withDefaults(defineProps<Props>(), {
  height: "300px",
  map: null,
});
const emit = defineEmits<{ (e: "regionClick", id: string): void }>();

const store = useStore();
const el = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let registeredMap: string | null = null;

const dark = () => !!store.getters.getSettings.darkMode;

function theme() {
  const base = dark() ? darkTheme : lightTheme;
  return {
    ...base,
    color: dark()
      ? PALETTE.map((c) => (c === "#000000" ? "#aaaaaa" : c))
      : [...PALETTE],
  };
}

function create() {
  if (!el.value) return;
  chart?.dispose();
  chart = echarts.init(el.value, theme());
  chart.on("click", (p: any) => {
    const id = p.data?.regionId ?? (p.componentType === "geo" ? p.name : null);
    if (id) emit("regionClick", String(id));
  });
  apply();
}

function apply() {
  if (!chart) return;
  if (props.map && registeredMap !== props.map.name) {
    echarts.registerMap(props.map.name, props.map.geoJson);
    registeredMap = props.map.name;
  }
  const option: Record<string, any> = {
    ...props.option,
    backgroundColor: "transparent",
  };
  // keep the user's pan/zoom when only the data changes
  const current = (chart.getOption() as any)?.geo?.[0];
  if (current && option.geo && current.map === option.geo.map) {
    option.geo = { ...option.geo, zoom: current.zoom, center: current.center };
  }
  chart.setOption(option, { notMerge: true });
}

onMounted(() => {
  create();
  resizeObserver = new ResizeObserver(() => chart?.resize());
  if (el.value) resizeObserver.observe(el.value);
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
  chart = null;
});

watch(() => props.option, apply);
watch(
  () => props.resetKey,
  () => {
    chart?.clear();
    apply();
  },
);
watch(dark, create);
</script>
