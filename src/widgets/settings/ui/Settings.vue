<template>
  <v-row justify="center">
    <v-navigation-drawer
      location="right"
      v-model="showMenu"
      width="512"
      temporary
    >
      <v-card class="overflow-y: auto">
        <v-toolbar color="primary">
          <v-btn icon @click="showMenu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-list lines="two">
          <v-list-subheader>Charts</v-list-subheader>
          <!--Features-->
          <ToggleBaseLine />
          <ToggleMinMax />
        </v-list>
        <v-divider></v-divider>
        <v-list>
          <v-list-subheader>Appearance</v-list-subheader>
          <!--Features-->
          <ToggleTheme></ToggleTheme>
          <ToggleDarkMode />
        </v-list>
        <v-divider></v-divider>
        <v-list>
          <v-list-subheader>Metadata</v-list-subheader>
          <!--Features-->
          <ToggleDefaultAnnotatonsMode />
          <ToggleDefaultAllNotesMode />
          <ExportNotes></ExportNotes>
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
import ToggleDarkMode from "./components/toggleDarkMode";
import ToggleBaseLine from "./components/toggleBaseLine";
import ToggleMinMax from "./components/toggleMinMax";
import ToggleTheme from "./components/toggleTheme";
import ToggleDefaultAnnotatonsMode from "./components/toggleDefaultAnnotationsMode/ToggleDefaultAnnotatonsMode.vue";

import { computed } from "vue";
import { useStore } from "vuex";
import ExportNotes from "@/widgets/settings/ui/components/exportNotes/ExportNotes.vue";
import { TOGGLE_UI_VISIBILITY } from "@/widgets/settings/model/store/actions.type";
import ToggleDefaultAllNotesMode from "@/widgets/settings/ui/components/toggleDefaultAllNotesMode/ToggleDefaultAllNotesMode.vue";

const store = useStore();

const showMenu = computed({
  get: function (): boolean {
    return store.getters.getVisibility;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_UI_VISIBILITY, value);
  },
});
</script>

<style scoped></style>
