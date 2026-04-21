<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-base font-medium leading-none">{{ darkMode ? "Dark mode" : "Light mode" }}</p>
      <p class="text-sm opacity-60 mt-1">Select the color mode</p>
    </div>
    <InputSwitch v-model="darkMode" />
  </div>
</template>

<script lang="ts">
export default {
  name: "ToggleDarkMode",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DARK_MODE } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const darkMode = computed({
  get: function (): boolean {
    return store.getters.getSettings.darkMode;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_DARK_MODE, value);
  },
});
</script>

<style scoped></style>
