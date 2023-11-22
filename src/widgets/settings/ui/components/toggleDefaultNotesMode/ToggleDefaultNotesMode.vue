<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="notesMode" />
    <div>
      <h3>{{ notesMode ? "On" : "Off" }}</h3>
      <p class="font-thin">Switch default notes mode</p>
    </div>
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

<style scoped></style>
