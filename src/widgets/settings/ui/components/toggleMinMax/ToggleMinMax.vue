<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="minMax" />
    <div>
      <h3 class="text-lg leading-none">{{ minMax ? "MIN/MAX" : "P10/P90" }}</h3>
      <p class="font-light">
        Applicable to some reports. Determines whether to use Min/Max or P10/P90
      </p>
    </div>
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
