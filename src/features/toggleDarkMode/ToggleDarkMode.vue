<template>
  <v-list-item
    :title="darkMode ? 'Dark Mode' : 'Light mode'"
    subtitle="Select the Color mode"
  >
    <template v-slot:prepend>
      <v-list-item-action>
        <v-switch v-model="darkMode"></v-switch>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "ToggleDarkMode",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DARK_MODE } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const darkMode = computed({
  get: function (): boolean {
    return store.getters.getSettings.darkMode;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_DARK_MODE, value);
  },
});
</script>

<style scoped></style>
