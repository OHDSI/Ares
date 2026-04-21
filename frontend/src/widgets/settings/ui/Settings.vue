<template>
  <Sidebar class="w-2/6" v-model:visible="showMenu" position="right">
    <template #header>
      <div>
        <h2 class="font-bold">Settings</h2>
      </div>
    </template>
    <div class="flex flex-col">
      <UserAccount />
      <Divider />

      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest opacity-50">Data settings</h3>
        <FavoriteSources class="w-full" />
      </div>
      <Divider />

      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest opacity-50">Charts</h3>
        <ToggleBaseLine />
        <ToggleMinMax />
      </div>
      <Divider />

      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest opacity-50">Appearance</h3>
        <ToggleDarkMode />
        <StickyNavBar />
        <TableStrippedRowsToggle />
        <PersistColumnSelection />
        <DrillDownViewOptions />
      </div>
      <Divider />

      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest opacity-50">Annotations</h3>
        <ToggleDefaultAnnotatonsMode />
        <ToggleDefaultNotesMode />
      </div>
      <Divider />

      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest opacity-50">Developer</h3>
        <ToggleDevWidget />
      </div>

      <div class="mt-6">
        <ExportNotes />
      </div>
    </div>
  </Sidebar>
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
import Divider from "primevue/divider";
import ToggleDefaultAnnotatonsMode from "./components/toggleDefaultAnnotationsMode";
import StickyNavBar from "@/widgets/settings/ui/components/stickyNavBar";
import TableStrippedRowsToggle from "@/widgets/settings/ui/components/strippedRows";
import PersistColumnSelection from "@/widgets/settings/ui/components/persistColumnSelection";

import { computed } from "vue";
import { useStore } from "vuex";
import ExportNotes from "@/widgets/settings/ui/components/exportNotes";
import { TOGGLE_UI_VISIBILITY } from "@/widgets/settings/model/store/actions.type";
import ToggleDefaultNotesMode from "@/widgets/settings/ui/components/toggleDefaultNotesMode";
import UserAccount from "@/widgets/settings/ui/components/userAccount";
import Sidebar from "primevue/sidebar";
import FavoriteSources from "@/widgets/settings/ui/components/favoriteSources";
import DrillDownViewOptions from "@/widgets/settings/ui/components/DrillDownViewOptions";
import ToggleDevWidget from "@/widgets/settings/ui/components/toggleDevWidget";

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
