<template>
  <Sidebar class="w-2/6" v-model:visible="showMenu" position="right">
    <template #header>
      <div>
        <h2 class="text-xs font-semibold uppercase tracking-widest opacity-50">
          Settings
        </h2>
      </div>
    </template>
    <div class="settings-content">
      <div class="section-card">
        <span class="section-label">Account</span>
        <UserAccount />
      </div>

      <div class="section-card">
        <span class="section-label">Data settings</span>
        <FavoriteSources class="w-full" />
      </div>

      <div class="section-card">
        <span class="section-label">Charts</span>
        <ToggleBaseLine />
        <ToggleMinMax />
      </div>

      <div class="section-card">
        <span class="section-label">Appearance</span>
        <ToggleDarkMode />
        <StickyNavBar />
        <TableStrippedRowsToggle />
        <PersistColumnSelection />
        <DrillDownViewOptions />
      </div>

      <div class="section-card">
        <span class="section-label">Annotations</span>
        <ToggleDefaultAnnotatonsMode />
        <ToggleDefaultNotesMode />
      </div>

      <div class="section-card">
        <span class="section-label">Developer</span>
        <ToggleDevWidget />
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
import ToggleDefaultAnnotatonsMode from "./components/toggleDefaultAnnotationsMode";
import StickyNavBar from "@/widgets/settings/ui/components/stickyNavBar";
import TableStrippedRowsToggle from "@/widgets/settings/ui/components/strippedRows";
import PersistColumnSelection from "@/widgets/settings/ui/components/persistColumnSelection";

import { computed } from "vue";
import { useStore } from "vuex";
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

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: bh-reveal 0.35s ease both;
}

.section-card {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.section-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

@keyframes bh-reveal {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
