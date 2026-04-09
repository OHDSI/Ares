<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="persistColumnSelection" />
    <div>
      <h3 class="text-lg leading-none">Remember column selections</h3>
      <p class="font-light">Save column visibility choices between sessions</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "PersistColumnSelection",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_PERSIST_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const persistColumnSelection = computed({
  get: function (): boolean {
    return store.getters.getSettings.persistColumnSelection;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_PERSIST_COLUMN_SELECTION, value);
  },
});
</script>

<style scoped></style>
