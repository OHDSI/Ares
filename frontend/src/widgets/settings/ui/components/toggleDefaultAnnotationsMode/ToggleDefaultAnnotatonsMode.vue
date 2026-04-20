<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-sm font-medium leading-none">Default annotations mode</p>
      <p class="text-xs opacity-60 mt-1">Open annotation panel by default</p>
    </div>
    <InputSwitch v-model="annotationsMode" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEFAULT_ANNOTATIONS_MODE } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const annotationsMode = computed({
  get: function (): boolean {
    return store.getters.getSettings.annotationsMode;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_DEFAULT_ANNOTATIONS_MODE, value);
  },
});
</script>

<style scoped></style>
