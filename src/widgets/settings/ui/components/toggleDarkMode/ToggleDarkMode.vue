<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="darkMode" />
    <div>
      <h3 class="text-lg leading-none">
        {{ darkMode ? "Dark Mode" : "Light mode" }}
      </h3>
      <p class="font-light">Select the Color mode</p>
    </div>
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
