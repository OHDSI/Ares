<template>
  <Toolbar unstyled class="fixed bottom-0 left-0 right-0">
    <template #end>
      <div class="flex flex-row gap-14 mr-3">
        <Button
          v-if="webApiEnabled"
          severity="secondary"
          @click="redirectTo('/network/web_api')"
          icon="pi pi-check"
          text
        >
          <svg-icon type="mdi" :path="mdiServer"></svg-icon>
        </Button>
        <Button
          severity="secondary"
          @click="openNewTab(links.getAresDocsLink())"
          icon="pi pi-check"
          text
        >
          <svg-icon type="mdi" :path="mdiHelpCircleOutline"></svg-icon>
        </Button>
        <Button
          severity="secondary"
          @click="redirectTo('/network/overview')"
          icon="pi pi-check"
          text
        >
          <svg-icon type="mdi" :path="mdiDatabase"></svg-icon>
        </Button>
        <Button
          severity="secondary"
          @click="redirectTo('/')"
          icon="pi pi-check"
          text
        >
          <img :class="iconClass" :src="logo" width="20" />
        </Button>
        <Button
          severity="secondary"
          icon="pi pi-check"
          text
          @click="toggleSettings"
        >
          <svg-icon type="mdi" :path="mdiCog"></svg-icon>
        </Button>
      </div>
    </template>
  </Toolbar>
</template>

<script lang="ts">
export default {
  name: "BottomNav",
};
</script>

<script setup lang="ts">
import { SET_VISIBILITY } from "@/widgets/settings/model/store/mutations.type";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import logo from "@/shared/assets/icon.png";
import { useStore } from "vuex";
import { computed } from "vue";
import environment from "@/shared/api/environment";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiCog, mdiDatabase, mdiHelpCircleOutline, mdiServer } from "@mdi/js";
import { useRouter } from "vue-router";
import { openNewTab } from "@/shared/lib/mixins/methods/openNewTab";
import { links } from "@/shared/config/links";

const webApiEnabled = environment.WEB_API_ENABLED;

const store = useStore();
const router = useRouter();

const iconClass = computed((): string => {
  return store.getters.getSettings.darkMode ? "darkmode" : "lightmode";
});

function redirectTo(path: string) {
  router.push(path);
}

const toggleSettings = function (): void {
  store.commit(SET_VISIBILITY, !store.getters.getVisibility);
};
</script>

<style scoped>
.lightmode {
  filter: invert(48%) sepia(15%) saturate(363%) hue-rotate(182deg)
    brightness(89%) contrast(89%);
}
.darkmode {
  filter: sepia(0%) saturate(393%) hue-rotate(238deg) brightness(80%)
    contrast(90%);
}
</style>
