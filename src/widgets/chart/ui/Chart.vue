<template>
  <div>
    <div class="title">
      <v-card-title v-if="title">{{ title }}</v-card-title>
      <v-btn
        v-if="annotations"
        variant="plain"
        @click="annotationMode = !annotationMode"
        >{{ annotationMode ? "Annotations on" : "Annotations off" }}</v-btn
      >
    </div>
    <div :id="id" :style="style"></div>
    <ContextMenu v-if="annotations" :items="actions" />
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
import { computed, watch, onBeforeMount, defineProps, ref } from "vue";
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router";
import { TopLevelSpec } from "vega-lite";
import ContextMenu from "@/entities/contextMenu/contextMenu.vue";
import {
  ADD_NEW_NOTE,
  DELETE_SELECTION,
  EDIT_SELECTION,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";

//Find a way to type function props
interface Props {
  title?: string;
  data: object[] | string[];
  id: string;
  width?: string;
  config: (a?: boolean, b?: boolean) => TopLevelSpec;
  annotationsConfig?: (a?: boolean, b?: boolean) => TopLevelSpec;
  clickListener?: (a: any, b: RouteLocationNormalizedLoaded, c: any) => void;
  signalListener?: (a: any, b: any) => void;
  notes?: [];
  contextMenuListener?: (a: any, b: any) => void;
  annotations?: boolean;
}

const actions = [
  {
    title: "Edit selection details",
    action: () => {
      const action = function (title, description) {
        store.dispatch(EDIT_SELECTION, {
          report: props.id,
          data: { title, description },
        });
      };
      store.dispatch(SHOW_DIALOG, {
        show: true,
        data: {
          title: store.getters.getSelectedRectangle.item.title,
          description: store.getters.getSelectedRectangle.item.description,
        },
        action,
      });
    },
  },
  {
    title: "Remove selection",
    action: () => {
      store.dispatch(DELETE_SELECTION, { report: props.id });
    },
  },
  {
    title: "Add note",
    action: () => {
      const action = function (title, description) {
        store.dispatch(ADD_NEW_NOTE, {
          report: props.id,
          data: { title, description },
        });
      };
      store.dispatch(SHOW_DIALOG, {
        show: true,
        data: null,
        action,
      });
    },
  },
];

const store = useStore();
const route = useRoute();
const props = defineProps<Props>();

const annotationMode = ref(false);

const processedConfig = computed(function (): TopLevelSpec {
  if (annotationMode.value) {
    return {
      ...props.annotationsConfig(
        store.getters.getSettings.zeroBaseline,
        store.getters.getSettings.minMax
      ),
      datasets: {
        conceptData: props.data,
        notesData: props.notes ? [...props.notes] : [],
      },
    };
  } else {
    return {
      ...props.config(
        store.getters.getSettings.zeroBaseline,
        store.getters.getSettings.minMax
      ),
      datasets: {
        conceptData: props.data,
      },
    };
  }
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
    if (props.clickListener) {
      props.clickListener(result, route, store);
    }
    if (props.signalListener && annotationMode.value) {
      props.signalListener(result, store);
    }
    if (props.contextMenuListener && annotationMode.value) {
      props.contextMenuListener(result, store);
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

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
