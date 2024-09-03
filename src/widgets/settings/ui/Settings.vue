<template>
  <Sidebar class="w-2/6" v-model:visible="showMenu" position="right">
    <template #header>
      <div>
        <h2 class="font-bold">Settings</h2>
      </div>
    </template>
    <div class="flex flex-col">
      <div>
        <UserAccount />
        <Divider />
      </div>
      <div class="flex flex-col">
        <div class="flex flex-col gap-5">
          <h3 class="text-left font-thin text-md">Charts</h3>
          <ToggleBaseLine />
          <ToggleMinMax />
        </div>
        <Divider></Divider>

        <div class="flex flex-col gap-5">
          <h3 class="text-left font-thin text-md">Appearance</h3>
          <ToggleDarkMode />
        </div>
        <Divider></Divider>

        <div class="flex flex-col gap-5">
          <h3 class="text-left font-thin text-md">Annotations</h3>
          <ToggleDefaultAnnotatonsMode />
          <ToggleDefaultNotesMode />
        </div>
        <div class="relative bottom-0 mt-4">
          <ExportNotes></ExportNotes>
        </div>
        <!--        <div class="relative bottom-0 mt-4">-->
        <!--          <cookie-test />-->
        <!--        </div>-->
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
import ToggleDefaultAnnotatonsMode from "./components/toggleDefaultAnnotationsMode/ToggleDefaultAnnotatonsMode.vue";

import { computed } from "vue";
import { useStore } from "vuex";
import ExportNotes from "@/widgets/settings/ui/components/exportNotes/ExportNotes.vue";
import { TOGGLE_UI_VISIBILITY } from "@/widgets/settings/model/store/actions.type";
import ToggleDefaultNotesMode from "@/widgets/settings/ui/components/toggleDefaultNotesMode/ToggleDefaultNotesMode.vue";
import UserAccount from "@/widgets/settings/ui/components/userAccount/UserAccount.vue";
import Sidebar from "primevue/sidebar";

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
