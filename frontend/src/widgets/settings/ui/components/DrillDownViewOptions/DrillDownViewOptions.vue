<template>
  <div class="flex flex-col gap-2">
    <span class="field-label">Drilldown view size</span>
    <Dropdown
      v-model="selectedOption"
      :options="options"
      option-label="title"
      option-value="value"
      placeholder="DrillDown view options"
    >
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { computed } from "vue";
import { CHANGE_DRILLDOWN_VIEW_OPTIONS } from "@/widgets/settings/model/store/actions.type";
import { useStore } from "vuex";

const store = useStore();

const options = [
  { title: "5/6", value: { class: "h-5/6", position: "bottom" } },
  { title: "2/3", value: { class: "h-2/3", position: "bottom" } },
  { title: "Full Screen", value: { class: "", position: "full" } },
];

// const selectedOption = ref(null);

const selectedOption = computed({
  get: function (): boolean {
    return store.getters.getSettings.drillDownViewOptions;
  },
  set: function (value: boolean): void {
    store.dispatch(CHANGE_DRILLDOWN_VIEW_OPTIONS, value);
  },
});
</script>

<style scoped>
.field-label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text-label);
}
</style>
