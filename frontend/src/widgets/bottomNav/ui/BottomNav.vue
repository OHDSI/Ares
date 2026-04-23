<template>
  <div class="bottom-nav">
    <Tooltip text="View release notes">
      <button class="version-btn" @click="openNewTab(links.aresReleaseInfo(appVersion))">
        <span class="version-number">{{ versionNumber }}</span>
        <span v-if="versionLabel" class="version-label">{{ versionLabel }}</span>
      </button>
    </Tooltip>

    <div class="flex flex-row gap-3 items-center pr-2">
      <Tooltip v-if="webApiEnabled" text="WebAPI">
        <Button
          severity="secondary"
          text
          :class="['nav-btn', { active: route.path.includes('web_api') }]"
          @click="router.push('/network/web_api')"
        >
          <svg-icon type="mdi" :path="mdiServer" />
        </Button>
      </Tooltip>

      <Tooltip text="Documentation">
        <Button severity="secondary" text class="nav-btn" @click="openNewTab(links.getAresDocsLink())">
          <svg-icon type="mdi" :path="mdiHelpCircleOutline" />
        </Button>
      </Tooltip>

      <Tooltip text="GitHub">
        <Button severity="secondary" text class="nav-btn" @click="openNewTab(links.aresGithubRepo())">
          <svg-icon class="github-icon" type="mdi" :path="mdiGithub" />
        </Button>
      </Tooltip>

      <Tooltip text="Network Overview">
        <Button
          severity="secondary"
          text
          :class="['nav-btn', { active: isNetworkActive }]"
          @click="router.push('/network/overview')"
        >
          <svg-icon type="mdi" :path="mdiDatabase" />
        </Button>
      </Tooltip>

      <Tooltip text="Home">
        <Button
          severity="secondary"
          text
          :class="['nav-btn', { active: route.path === '/' }]"
          @click="router.push('/')"
        >
          <img :class="iconClass" :src="logo" />
        </Button>
      </Tooltip>

      <Tooltip text="Settings">
        <Button severity="secondary" text class="nav-btn" @click="toggleSettings">
          <svg-icon type="mdi" :path="mdiCog" />
        </Button>
      </Tooltip>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BottomNav",
};
</script>

<script setup lang="ts">
import { SET_VISIBILITY } from "@/widgets/settings/model/store/mutations.type";
import Button from "primevue/button";
import Tooltip from "@/shared/ui/tooltip";
import logo from "@/shared/assets/icon.png";
import { useStore } from "vuex";
import { computed } from "vue";
import environment from "@/shared/api/environment";
import SvgIcon from "@/shared/ui/svgIcon";
import {
  mdiCog,
  mdiDatabase,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiServer,
} from "@mdi/js";
import { useRouter, useRoute } from "vue-router";
import { openNewTab } from "@/shared/lib/utils";
import { links } from "@/shared/config/links";

const appVersion = "v" + __APP_VERSION__;
const versionParts = appVersion.split("-");
const versionNumber = versionParts[0];
const versionLabel = versionParts[1] ?? null;

const webApiEnabled = environment.WEB_API_ENABLED;

const store = useStore();
const router = useRouter();
const route = useRoute();

const darkMode = computed(() => store.getters.getSettings.darkMode);

const navBg = computed(() => darkMode.value ? "#212121" : "#ffffff");
const navBorder = computed(() => darkMode.value ? "#3a3a3a" : "#e2e8f0");
const iconColor = computed(() => darkMode.value ? "rgba(148,163,184,0.8)" : "rgba(100,116,139,0.8)");
const iconActiveColor = computed(() => darkMode.value ? "#e2e8f0" : "#334155");
const betaColor = computed(() => darkMode.value ? "#94a3b8" : "#64748b");
const betaBg = computed(() => darkMode.value ? "rgba(148,163,184,0.08)" : "rgba(100,116,139,0.07)");
const betaBorder = computed(() => darkMode.value ? "rgba(148,163,184,0.2)" : "rgba(100,116,139,0.2)");

const iconClass = computed((): string =>
  darkMode.value ? "darkmode" : "lightmode"
);

const isNetworkActive = computed(() =>
  route.path.includes("network") && !route.path.includes("web_api")
);

const toggleSettings = function (): void {
  store.commit(SET_VISIBILITY, !store.getters.getVisibility);
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: v-bind(navBg);
  border-top: 1px solid v-bind(navBorder);
  z-index: 100;
}

.version-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
}

.version-number {
  font-family: ui-monospace, monospace;
  font-weight: 400;
  font-size: 0.8125rem;
  color: v-bind(iconColor);
  text-decoration: none;
  transition: text-decoration 0.15s ease;
}

.version-btn:hover .version-number {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.version-label {
  font-family: ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 500;
  color: v-bind(betaColor);
  background: v-bind(betaBg);
  border: 1px solid v-bind(betaBorder);
  border-radius: 3px;
  padding: 0 0.3rem;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.nav-btn) {
  color: v-bind(iconColor);
  padding: 0.375rem;
  width: 36px;
  height: 36px;
  transition: color 0.15s ease;
}

:deep(.nav-btn:hover),
:deep(.nav-btn.active) {
  color: v-bind(iconActiveColor);
}

:deep(.nav-btn svg),
:deep(.nav-btn .mdi) {
  width: 22px;
  height: 22px;
}

:deep(.nav-btn img) {
  width: 17px;
  height: 17px;
}

.lightmode {
  filter: invert(48%) sepia(15%) saturate(363%) hue-rotate(182deg)
    brightness(89%) contrast(89%);
}
.darkmode {
  filter: sepia(0%) saturate(393%) hue-rotate(238deg) brightness(80%)
    contrast(90%);
}
</style>
