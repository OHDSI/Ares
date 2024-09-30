<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="zeroBaseLine" />
    <div>
      <h3 class="text-lg leading-none">
        {{ zeroBaseLine ? "Zero Baseline" : "Non-zero baseline" }}
      </h3>
      <p class="font-light">
        Determines whether the axis starts from the 0 or the lowest value in the
        set
      </p>
    </div>
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
