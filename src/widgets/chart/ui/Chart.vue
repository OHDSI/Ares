<template>
  <div>
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <div :id="id" :style="style"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: "VegaChart",
};
</script>

<script setup lang="ts">
import embed from "vega-embed";
import { useStore } from "vuex";
import { computed, watch, onBeforeMount, defineProps } from "vue";
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router";
import { TopLevelSpec } from "vega-lite";

//Find a way to type function props
interface Props {
  title?: string;
  data: object[] | string[];
  id: string;
  width?: string;
  config: (a?: boolean, b?: boolean) => TopLevelSpec;
  listener?: (a: any, b: RouteLocationNormalizedLoaded) => void;
}
const store = useStore();
const route = useRoute();
const props = defineProps<Props>();

const processedConfig = computed(function (): TopLevelSpec {
  return {
    ...props.config(
      store.getters.getSettings.zeroBaseline,
      store.getters.getSettings.minMax
    ),
    data: { values: props.data },
  };
});

const darkMode = computed(function (): boolean {
  return store.getters.getSettings.darkMode;
});

const style = computed(function (): string {
  return props.width ? "width: " + props.width + "%" : "width: 100%";
});

const load = function (): void {
  embed(`#${props.id}`, processedConfig.value, {
    theme: store.getters.getSettings.darkMode ? "dark" : undefined,
  }).then((result) => {
    if (props.listener) {
      props.listener(result, route);
    }
  });
};

watch(darkMode, (): void => {
  load();
});

watch(processedConfig, (): void => {
  load();
});

onBeforeMount((): void => {
  load();
});
</script>

<style scoped></style>
