<template>
  <div
    ref="layoutRef"
    class="strategus-layout"
    :style="{
      '--doc-scrollbar-color': sectionBorder,
      '--doc-scrollbar-hover': mutedColor,
    }"
  >
    <aside
      :class="['strategus-sidebar', { 'sidebar-open': sidebarExpanded }]"
    >
      <div v-if="dbList.length > 1" class="schema-nav-wrap">
        <div class="nav-item schema-item">
          <i class="pi pi-server" />
          <Dropdown
            v-model="selectedSchema"
            :options="dbList"
            optionLabel="dbName"
            optionValue="schemaName"
            class="nav-label schema-dropdown"
            :pt="{
              root: {
                class:
                  '!border-0 !bg-transparent !shadow-none !ring-0 hover:!border-0',
              },
              input: {
                class:
                  '!p-0 !text-inherit !font-medium !text-sm !border-b !border-dashed !border-current/50',
              },
              trigger: { class: '!hidden' },
              panel: {
                onMouseenter: () => (schemaDropdownOpen = true),
                onMouseleave: () => (schemaDropdownOpen = false),
              },
            }"
            @show="schemaDropdownOpen = true"
            @hide="onSchemaHide"
          />
        </div>
        <div class="nav-separator" />
      </div>

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
      <template v-if="schemaReady">
        <Transition name="section-fade" mode="out-in">
          <component
            :is="sections[currentSection].component"
            :key="`${currentSection}-${selectedSchema ?? ''}`"
          />
        </Transition>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, markRaw, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Dropdown from "primevue/dropdown";

import DataSources from "@/pages/strategus/DataSources.vue";
import Characterization from "@/pages/strategus/characterization/Characterization.vue";
import Documents from "@/pages/strategus/Documents.vue";
import {
  StrategusService,
  setStrategusSchema,
} from "@/shared/api/aresApi/services/strategusService";

const router = useRouter();
const route = useRoute();
const store = useStore();
const sidebarOpen = ref(false);
const schemaDropdownOpen = ref(false);
let sidebarCloseTimer: ReturnType<typeof setTimeout> | null = null;

function onSidebarEnter() {
  if (sidebarCloseTimer) {
    clearTimeout(sidebarCloseTimer);
    sidebarCloseTimer = null;
  }
  sidebarOpen.value = true;
}

function onSidebarLeave() {
  if (sidebarCloseTimer) {
    clearTimeout(sidebarCloseTimer);
    sidebarCloseTimer = null;
  }
  sidebarOpen.value = false;
}

const layoutRef = ref<HTMLElement | null>(null);

function onDocMouseMove(e: MouseEvent) {
  if (!layoutRef.value) return;
  const rect = layoutRef.value.getBoundingClientRect();
  const relX = e.clientX - rect.left;
  const inVerticalBounds = e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!inVerticalBounds) return;
  if (relX >= -100 && relX < 60) {
    onSidebarEnter();
  } else if (relX > 230) {
    onSidebarLeave();
  }
}
const sidebarExpanded = computed(
  () => sidebarOpen.value || schemaDropdownOpen.value
);

function onSchemaHide() {
  setTimeout(() => {
    schemaDropdownOpen.value = false;
  }, 100);
}

const dbList = ref<
  { dbName: string; schemaName: string; releaseDate: string }[]
>([]);
const selectedSchema = ref<string | undefined>(undefined);
const schemaReady = ref(false);

onMounted(() => {
  document.addEventListener("mousemove", onDocMouseMove);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDocMouseMove);
});

onMounted(async () => {
  try {
    const res = await StrategusService.dbList.getDbList();

    dbList.value = res.data ?? [];
    if (dbList.value.length > 0) {
      const urlSchema = route.query.schema as string | undefined;
      const valid =
        urlSchema && dbList.value.some((d) => d.schemaName === urlSchema);
      selectedSchema.value = valid ? urlSchema : dbList.value[0].schemaName;
    }
  } catch {
    // db-list unavailable — proceed with server default schema
  } finally {
    schemaReady.value = true;
  }
});

watch(selectedSchema, (schema) => {
  if (!schema) return;
  setStrategusSchema(schema);
  router.replace({ query: { ...route.query, schema } });
});

const darkMode = computed(() => store.getters.getSettings.darkMode);
const sectionBorder = computed(() => (darkMode.value ? "#5a5a5a" : "#94a3b8"));
const mutedColor = computed(() => (darkMode.value ? "#9ca3af" : "#94a3b8"));
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
  {
    key: "documents",
    label: "Study Protocol",
    icon: "pi pi-file",
    component: markRaw(Documents),
  },
];

const currentSection = computed(() => {
  return parseInt(route.query.report as string) || 0;
});

const setCurrentTab = function (val: number) {
  const query: Record<string, any> = { report: val };
  if (route.query.schema) query.schema = route.query.schema;
  router.push({ query });
};
</script>

<style scoped>
.nav-item.schema-item:hover {
  color: v-bind(navItemHoverColor);
  border-left-color: transparent;
}

.schema-dropdown {
  flex: 1;
  min-width: 0;
}

.nav-separator {
  margin: 0.375rem 0.875rem 0.25rem;
  border-top: 1.5px solid v-bind(navItemHoverBorder);
}

.strategus-layout {
  display: flex;
}

.strategus-sidebar {
  width: 52px;
  flex-shrink: 0;
  padding: 0 0 1rem;
  transition: width 0.2s ease;
  overflow: hidden;
}

.strategus-sidebar.sidebar-open {
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
  user-select: none;
  transition: color 0.15s ease, border-left-color 0.15s ease;
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

.strategus-sidebar.sidebar-open .nav-label {
  opacity: 1;
}

.strategus-content {
  flex: 1;
  min-width: 0;
  padding: 0 1.5rem 1.25rem;
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

<style>
html:is(.dark, :not(.dark)) .strategus-content *::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

html:is(.dark, :not(.dark)) .strategus-content *::-webkit-scrollbar-track {
  background: transparent;
  margin-top: 8px;
  margin-bottom: 8px;
}

html:is(.dark, :not(.dark))
  .strategus-content
  *::-webkit-scrollbar-thumb:vertical {
  border-radius: 0;
  background: linear-gradient(
        to bottom right,
        transparent 49%,
        var(--doc-scrollbar-color) 51%
      )
      0 0 / 100% 6px no-repeat,
    linear-gradient(var(--doc-scrollbar-color), var(--doc-scrollbar-color)) 0
      6px / 100% calc(100% - 12px) no-repeat,
    linear-gradient(
        to top left,
        transparent 49%,
        var(--doc-scrollbar-color) 51%
      )
      0 100% / 100% 6px no-repeat;
}

html:is(.dark, :not(.dark))
  .strategus-content
  *::-webkit-scrollbar-thumb:vertical:hover {
  background: linear-gradient(
        to bottom right,
        transparent 49%,
        var(--doc-scrollbar-hover) 51%
      )
      0 0 / 100% 6px no-repeat,
    linear-gradient(var(--doc-scrollbar-hover), var(--doc-scrollbar-hover)) 0
      6px / 100% calc(100% - 12px) no-repeat,
    linear-gradient(
        to top left,
        transparent 49%,
        var(--doc-scrollbar-hover) 51%
      )
      0 100% / 100% 6px no-repeat;
}

html:is(.dark, :not(.dark))
  .strategus-content
  *::-webkit-scrollbar-thumb:horizontal {
  border-radius: 0;
  background: linear-gradient(
        to bottom right,
        transparent 49%,
        var(--doc-scrollbar-color) 51%
      )
      0 0 / 6px 100% no-repeat,
    linear-gradient(var(--doc-scrollbar-color), var(--doc-scrollbar-color)) 6px
      0 / calc(100% - 12px) 100% no-repeat,
    linear-gradient(
        to bottom left,
        transparent 49%,
        var(--doc-scrollbar-color) 51%
      )
      100% 0 / 6px 100% no-repeat;
}

html:is(.dark, :not(.dark))
  .strategus-content
  *::-webkit-scrollbar-thumb:horizontal:hover {
  background: linear-gradient(
        to bottom right,
        transparent 49%,
        var(--doc-scrollbar-hover) 51%
      )
      0 0 / 6px 100% no-repeat,
    linear-gradient(var(--doc-scrollbar-hover), var(--doc-scrollbar-hover)) 6px
      0 / calc(100% - 12px) 100% no-repeat,
    linear-gradient(
        to bottom left,
        transparent 49%,
        var(--doc-scrollbar-hover) 51%
      )
      100% 0 / 6px 100% no-repeat;
}
</style>
