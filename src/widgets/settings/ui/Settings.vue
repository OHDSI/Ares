<template>
  <v-row justify="center">
    <v-navigation-drawer
      location="right"
      v-model="showMenu"
      width="512"
      temporary
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showMenu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-list three-line subheader>
          <v-list-subheader>Charts</v-list-subheader>
          <!--Features-->
          <ToggleBaseLine />
          <ToggleMinMax />
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-list-subheader>General</v-list-subheader>
          <!--Features-->
          <ToggleDarkMode />
        </v-list>
      </v-card>
    </v-navigation-drawer>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "SettingsMenu",
};
</script>

<script setup lang="ts">
import { settingsActions } from "@/widgets/settings";
import ToggleDarkMode from "@/features/toggleDarkMode";
import ToggleBaseLine from "@/features/toggleBaseLine";
import ToggleMinMax from "@/features/toggleMinMax";

import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const showMenu = computed({
  get: function (): boolean {
    return store.getters.getVisibility;
  },
  set: function (value: boolean): void {
    store.dispatch(settingsActions.CHANGE_UI_VISIBILITY, value);
  },
});
</script>

<style scoped></style>
