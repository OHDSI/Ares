<template>
  <v-list-item
    :title="annotationsMode ? 'On' : 'Off'"
    subtitle="Switch default annotations mode"
  >
    <template v-slot:prepend>
      <v-list-item-action>
        <v-switch class="mr-2" v-model="annotationsMode"></v-switch>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEFAULT_ANNOTATIONS_MODE } from "@/widgets/settings/model/store/actions.type";

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
