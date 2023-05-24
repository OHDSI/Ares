<template>
  <v-list-item subtitle="Select a theme">
    <v-list-item-action>
      <v-select
        v-model="activeTheme"
        density="compact"
        variant="outlined"
        :items="themes"
        item-title="title"
        item-value="value"
        :menu-props="{}"
      ></v-select>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "ToggleTheme",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_THEME_SETTING } from "@/widgets/settings/model/store/actions.type";
const themes = [
  { title: "Purple", value: "purple" },
  { title: "Blue", value: "blue" },
];
const store = useStore();

const activeTheme = computed({
  get: function (): string {
    return store.getters.getSettings.theme;
  },
  set: function (value: string): void {
    store.dispatch(TOGGLE_THEME_SETTING, value);
  },
});
</script>

<style lang="scss">
.bg-transparent {
  background-color: rgb(var(--v-theme-surface)) !important;
}
</style>
