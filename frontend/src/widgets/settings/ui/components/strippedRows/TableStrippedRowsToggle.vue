<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="strippedRows" />
    <div>
      <h3 class="text-lg leading-none">Stripped rows</h3>
      <p class="font-light">Render alternating table rows in different color</p>
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
import { TOGGLE_STRIPPED_ROWS } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const strippedRows = computed({
  get: function (): boolean {
    return store.getters.getSettings.strippedRows;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_STRIPPED_ROWS, value);
  },
});
</script>

<style scoped></style>
