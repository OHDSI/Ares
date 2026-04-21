<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-base font-medium leading-none">{{ minMax ? "MIN/MAX" : "P10/P90" }}</p>
      <p class="text-sm opacity-60 mt-1">Use Min/Max or P10/P90 range in applicable reports</p>
    </div>
    <InputSwitch v-model="minMax" />
  </div>
</template>

<script lang="ts">
export default {
  name: "ToggleMinMax",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_MINMAX_SETTING } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const minMax = computed({
  get: function (): boolean {
    return store.getters.getSettings.minMax;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_MINMAX_SETTING, value);
  },
});
</script>

<style scoped></style>
