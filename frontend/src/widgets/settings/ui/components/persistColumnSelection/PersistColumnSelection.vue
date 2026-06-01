<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-base font-medium leading-none">
        Remember column selections
      </p>
      <p class="setting-desc">
        Save column visibility choices between sessions
      </p>
    </div>
    <InputSwitch v-model="persistColumnSelection" />
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

<style scoped>
.setting-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}
</style>
