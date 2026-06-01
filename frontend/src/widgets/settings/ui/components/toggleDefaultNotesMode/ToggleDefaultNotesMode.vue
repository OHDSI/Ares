<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-base font-medium leading-none">Default notes mode</p>
      <p class="setting-desc">Open notes panel by default</p>
    </div>
    <InputSwitch v-model="notesMode" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEFAULT_ALL_NOTES_MODE } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const notesMode = computed({
  get: function (): boolean {
    return store.getters.getSettings.notesMode;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_DEFAULT_ALL_NOTES_MODE, value);
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
