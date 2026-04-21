<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-base font-medium leading-none">{{ zeroBaseLine ? "Zero baseline" : "Non-zero baseline" }}</p>
      <p class="text-sm opacity-60 mt-1">Whether the axis starts from 0 or the lowest value</p>
    </div>
    <InputSwitch v-model="zeroBaseLine" />
  </div>
</template>

<script lang="ts">
export default {
  name: "ToggleBaseLine",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_BASELINE_SETTING } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const zeroBaseLine = computed({
  get: function (): boolean {
    return store.getters.getSettings.zeroBaseline;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_BASELINE_SETTING, value);
  },
});
</script>

<style scoped></style>
