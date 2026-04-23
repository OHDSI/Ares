<template>
  <div
    v-if="store.getters.explorerLoaded"
    ref="el"
    id="explorer"
    class="flex flex-row gap-8 pt-7 pb-3 items-end"
    :class="{ sticky: isSticky, 'is-stuck': isSticky && isStuck }"
  >
    <Button class="logo-button" text @click="router.push('/')">
      <img
        :class="{ inverted: !isDarkMode }"
        :src="icon"
        alt="Ares logo"
        width="45"
      />
    </Button>

    <TransitionGroup
      v-if="hasExplorerData"
      tag="div"
      name="explorer-dropdown"
      class="flex flex-row items-end"
    >
      <FloatLabel key="folder">
        <Dropdown
          inputId="folder"
          :model-value="store.getters.getSelectedFolder"
          @update:modelValue="changeFolder"
          :options="config.folders"
          optionLabel="name"
        >
          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <SvgIcon type="mdi" :path="option.icon" />
              <span>{{ option.name }}</span>
            </div>
          </template>
        </Dropdown>
        <label class="font-light text-surface-500" for="folder"
          >Report category</label
        >
      </FloatLabel>

      <div
        v-if="showSourceSelector"
        key="source"
        class="explorer-dropdown-group"
      >
        <SvgIcon class="chevron" type="mdi" :path="mdiChevronRight" />
        <FloatLabel>
          <Dropdown
            inputId="source"
            :model-value="store.getters.getSelectedSource"
            @update:modelValue="changeSource"
            :options="store.getters.getSources"
            optionLabel="cdm_source_abbreviation"
          />
          <label class="left-3 font-light text-surface-500" for="source"
            >Source</label
          >
        </FloatLabel>
      </div>

      <div
        v-if="showReleaseSelector"
        key="release"
        class="explorer-dropdown-group"
      >
        <SvgIcon class="chevron" type="mdi" :path="mdiChevronRight" />
        <FloatLabel>
          <Dropdown
            inputId="release"
            :model-value="store.getters.getSelectedRelease"
            @update:modelValue="changeRelease"
            :options="store.getters.getReleases"
            optionLabel="release_name"
          />
          <label
            class="relative left-3 top-0 font-light text-surface-500"
            for="release"
            >Release</label
          >
        </FloatLabel>
      </div>

      <div key="report" class="explorer-dropdown-group">
        <SvgIcon class="chevron" type="mdi" :path="mdiChevronRight" />
        <FloatLabel>
          <CascadeSelect
            inputId="report"
            :options="store.getters.getFilteredReports"
            :model-value="store.getters.getSelectedReport"
            @update:modelValue="changeReport"
            optionLabel="name"
            optionGroupLabel="name"
            :optionGroupChildren="['reports']"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <SvgIcon type="mdi" :path="option.icon" />
                <span>{{ option.name }}</span>
              </div>
            </template>
          </CascadeSelect>
          <label class="font-light text-surface-500" for="report">Report</label>
        </FloatLabel>
      </div>

      <div v-if="conceptParam" key="concept" class="explorer-dropdown-group">
        <FloatLabel>
          <InputText inputId="concept" :value="String(conceptParam)" readonly />
          <label class="font-light text-surface-500" for="concept"
            >Concept ID</label
          >
        </FloatLabel>
      </div>

      <div v-if="cohortParam" key="cohort" class="explorer-dropdown-group">
        <FloatLabel>
          <InputText inputId="cohort" :value="String(cohortParam)" readonly />
          <label class="font-light text-surface-500" for="cohort"
            >Cohort ID</label
          >
        </FloatLabel>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import CascadeSelect from "primevue/cascadeselect";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import SvgIcon from "@/shared/ui/svgIcon";

import { mdiChevronRight } from "@mdi/js";
import icon from "@/shared/assets/icon.png";
import config from "@/widgets/explorer/config";
import type {
  Source,
  SourceRelease,
} from "@/processes/exploreReports/model/interfaces/files/SourceIndex";

interface FolderOption {
  key: string;
  name: string;
  icon: string;
}

interface ReportOption {
  routeName: string;
  domain: string;
  name: string;
  icon: string;
}

const route = useRoute();
const router = useRouter();
const store = useStore();

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
const chevronColor = computed(() => (isDarkMode.value ? "white" : "black"));
const isSticky = computed(
  () => store.getters.getSettings?.stickyNavBar ?? false
);

const hasExplorerData = computed(() => {
  return !!store.getters.getSelectedFolder;
});

const conceptParam = computed(() => route.params.concept || null);
const cohortParam = computed(() => route.params.cohort_id || null);

const showSourceSelector = computed(() => {
  const folder = store.getters.getSelectedFolder;
  if (!folder) return false;
  return folder.key === "datasource" || folder.key === "cdm";
});

const showReleaseSelector = computed(() => {
  const folder = store.getters.getSelectedFolder;
  if (!folder) return false;
  return folder.key === "cdm";
});

function changeSource(source: Source): void {
  const folder = store.getters.getSelectedFolder;
  if (!folder) return;
  const release = folder.key === "cdm" ? source.releases[0].release_id : null;
  router.push({
    params: { ...route.params, cdm: source.cdm_source_key, release },
  });
}

function changeRelease(release: SourceRelease): void {
  router.push({ params: { ...route.params, release: release.release_id } });
}

function changeFolder(folder: FolderOption): void {
  const settings = store.getters.getSettings;
  const sources = store.getters.getSources;
  if (!settings || !sources?.length) return;

  const selectedSource: Source | null = store.getters.getSelectedSource;
  const selectedRelease: SourceRelease | null =
    store.getters.getSelectedRelease;

  const defaultSourceKey = Object.keys(settings.defaultSources ?? {}).find(
    (key) => sources.some((s: Source) => s.cdm_source_key === key)
  );
  const defaultSource: Source | undefined = sources.find(
    (s: Source) => s.cdm_source_key === defaultSourceKey
  );
  const fallbackSource: Source = selectedSource ?? sources[0];

  if (folder.key === "datasource") {
    const cdm = (defaultSource ?? fallbackSource).cdm_source_key;
    router.push({ name: folder.key, params: { cdm } });
    return;
  }

  if (folder.key === "cdm") {
    if (defaultSource && !selectedRelease) {
      const release = defaultSource.releases.find((r) =>
        settings.defaultSources[defaultSource.cdm_source_key].includes(
          r.release_id
        )
      )?.release_id;
      router.push({
        name: folder.key,
        params: { cdm: defaultSource.cdm_source_key, release },
      });
    } else {
      const cdm = fallbackSource.cdm_source_key;
      const release = fallbackSource.releases[0].release_id;
      router.push({ name: folder.key, params: { cdm, release } });
    }
    return;
  }

  router.push({ name: folder.key });
}

function changeReport(report: ReportOption): void {
  if (!report) return;
  router.push({
    name: report.routeName,
    params: { ...route.params, domain: report.domain, concept: "" },
  });
}
</script>

<style scoped lang="scss">
.inverted {
  filter: invert(1);
}

.explorer-dropdown-group {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding-left: 1rem;
  box-sizing: border-box;
}

.explorer-dropdown-move {
  transition: transform 0.2s ease;
}

.explorer-dropdown-enter-active,
.explorer-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, max-width 0.2s ease;
  overflow: hidden;
  max-width: 400px;
}

.explorer-dropdown-enter-from,
.explorer-dropdown-leave-to {
  opacity: 0;
  transform: translateX(-10px);
  max-width: 0;
}

.chevron {
  opacity: 0.25;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  transform: scale(0.6);
  margin-left: -0.75rem;
  margin-right: -0.75rem;
  color: v-bind(chevronColor);
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
  @apply dark:bg-surface-900 bg-white;
}
</style>
