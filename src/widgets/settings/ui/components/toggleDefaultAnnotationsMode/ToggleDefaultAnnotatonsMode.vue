<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="annotationsMode" />
    <div>
      <h3>{{ annotationsMode ? "On" : "Off" }}</h3>
      <p class="font-thin">Switch default annotations mode</p>
    </div>
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
