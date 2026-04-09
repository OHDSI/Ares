<template>
  <div class="strategus-layout">
    <aside
      class="strategus-sidebar"
      @mouseenter="sidebarOpen = true"
      @mouseleave="sidebarOpen = false"
    >
      <nav class="sidebar-nav">
        <button
          v-for="(section, idx) in sections"
          :key="section.key"
          :class="['nav-item', { active: currentSection === idx }]"
          @click="setCurrentTab(idx)"
          v-tooltip.right="{
            value: section.label,
            disabled: sidebarOpen,
            pt: {
              root: '',
              arrow: { style: {} },
              text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black text-xs font-normal p-2',
            },
          }"
        >
          <i :class="section.icon" />
          <span class="nav-label">{{ section.label }}</span>
        </button>
      </nav>
    </aside>

    <main class="strategus-content">
      <Transition name="section-fade" mode="out-in">
        <component
          :is="sections[currentSection].component"
          :key="currentSection"
        />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, markRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import DataSources from "@/pages/strategus/DataSources.vue";
import Characterization from "@/pages/strategus/characterization/Characterization.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();
const sidebarOpen = ref(false);

const darkMode = computed(() => store.getters.getSettings.darkMode);
const sidebarBorder = computed(() => (darkMode.value ? "#2a2a2a" : "#e5e7eb"));
const navItemColor = computed(() => (darkMode.value ? "#94a3b8" : "#64748b"));
const navItemHoverColor = computed(() =>
  darkMode.value ? "#e2e8f0" : "#334155"
);
const navItemHoverBorder = computed(() =>
  darkMode.value ? "#4b5563" : "#cbd5e1"
);

const sections = [
  {
    key: "datasources",
    label: "Data Sources",
    icon: "pi pi-database",
    component: markRaw(DataSources),
  },
  {
    key: "characterization",
    label: "Characterization",
    icon: "pi pi-chart-bar",
    component: markRaw(Characterization),
  },
];

const currentSection = computed(() => {
  return parseInt(route.query.report as string) || 0;
});

const setCurrentTab = function (val: number) {
  router.push({ query: { report: val } });
};
</script>

<style scoped>
.strategus-layout {
  display: flex;
}

.strategus-sidebar {
  width: 52px;
  flex-shrink: 0;
  padding: 1rem 0;
  transition: width 0.2s ease;
  overflow: hidden;
}

.strategus-sidebar:hover {
  width: 210px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border: none;
  border-left: 3px solid transparent;
  border-radius: 0 6px 6px 0;
  background: transparent;
  color: v-bind(navItemColor);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;
  white-space: nowrap;
}

.nav-item:hover {
  color: v-bind(navItemHoverColor);
  border-left-color: v-bind(navItemHoverBorder);
}

.nav-item.active {
  color: v-bind(navItemHoverColor);
  font-weight: 600;
  border-left-color: var(--primary-500, #3b82f6);
}

.nav-item i {
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.nav-label {
  opacity: 0;
  transition: opacity 0.15s ease 0.05s;
}

.strategus-sidebar:hover .nav-label {
  opacity: 1;
}

.strategus-content {
  flex: 1;
  min-width: 0;
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
}

.section-fade-leave-active {
  transition: opacity 0.1s ease;
}

.section-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.section-fade-enter-from,
.section-fade-leave-to {
  opacity: 0;
}

.section-fade-enter-from {
  transform: translateY(5px);
}
</style>
