<template>
  <div
    v-if="store.getters.explorerLoaded"
    ref="el"
    id="explorer"
    class="flex flex-row gap-8 pt-7 pb-3 items-end"
    :class="{ sticky: isSticky, 'is-stuck': isSticky && isStuck }"
  >
    <Button class="logo-button flex-shrink-0" text @click="router.push('/')">
      <img
        :class="{ inverted: !isDarkMode }"
        :src="icon"
        alt="Ares logo"
        width="45"
      />
    </Button>

    <AresMode v-if="isAresMode" />
    <StrategusMode v-else-if="isStrategusMode" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import icon from "@/shared/assets/icon.png";
import AresMode from "./aresMode";
import StrategusMode from "./strategusMode";

const store = useStore();
const route = useRoute();
const router = useRouter();

const el = ref<HTMLElement | null>(null);
const isStuck = ref(false);

watch(
  el,
  (newEl, _, onCleanup) => {
    if (!newEl) return;
    const update = () => {
      isStuck.value = window.scrollY > 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", update));
  },
  { immediate: true }
);

const isDarkMode = computed(() => store.getters.getSettings?.darkMode ?? false);
const isSticky = computed(
  () => store.getters.getSettings?.stickyNavBar ?? false
);
const isAresMode = computed(() => !!store.getters.getSelectedFolder);
const isStrategusMode = computed(() =>
  route.path.startsWith("/characterization")
);
</script>

<style scoped lang="scss">
.inverted {
  filter: invert(1);
}

.logo-button {
  opacity: 0.5;
  transition: opacity 0.25s ease !important;

  &:hover {
    opacity: 1;
  }
}

.sticky {
  position: sticky;
  top: 0;
  border-bottom: 1px solid transparent;
  transition: box-shadow 0.2s ease, border-color 0.2s ease,
    padding-top 0.2s ease;
}

.sticky :deep(label) {
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sticky.is-stuck {
  padding-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-bottom-color: rgba(0, 0, 0, 0.08);

  .dark & {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  :deep(label) {
    opacity: 0;
  }
}

#explorer {
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
  overflow: hidden;
  @apply dark:bg-surface-900 bg-white;
}
</style>
