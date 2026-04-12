<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="explorer"
    class="container flex flex-row gap-16 p-2 pb-3 pt-6 items-end content-center"
    :class="{ sticky: isSticky }"
  >
    <Button class="logo-button" text @click="router.push('/')">
      <img
        :class="{ inverted: !isDarkMode }"
        :src="icon"
        alt="Ares logo"
        width="45"
      />
    </Button>

    <div v-if="hasExplorerData" class="flex flex-row gap-5 items-end">
      <FloatLabel>
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
        <label class="font-light dark:text-white text-black" for="folder"
          >Report category</label
        >
      </FloatLabel>

      <FloatLabel v-if="showSourceSelector">
        <Dropdown
          inputId="source"
          :model-value="store.getters.getSelectedSource"
          @update:modelValue="changeSource"
          :options="store.getters.getSources"
          optionLabel="cdm_source_abbreviation"
        />
        <label class="left-3 font-light dark:text-white text-black" for="source"
          >Source</label
        >
      </FloatLabel>

      <FloatLabel v-if="showReleaseSelector">
        <Dropdown
          inputId="release"
          :model-value="store.getters.getSelectedRelease"
          @update:modelValue="changeRelease"
          :options="store.getters.getReleases"
          optionLabel="release_name"
        />
        <label
          class="relative left-3 top-0 font-light dark:text-white text-black"
          for="release"
          >Release</label
        >
      </FloatLabel>

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
        <label class="font-light dark:text-white text-black" for="report"
          >Report</label
        >
      </FloatLabel>

      <FloatLabel v-if="conceptParam">
        <InputText inputId="concept" :value="String(conceptParam)" readonly />
        <label class="font-light dark:text-white text-black" for="concept"
          >Concept ID</label
        >
      </FloatLabel>

      <FloatLabel v-if="cohortParam">
        <InputText inputId="cohort" :value="String(cohortParam)" readonly />
        <label class="font-light dark:text-white text-black" for="cohort"
          >Cohort ID</label
        >
      </FloatLabel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import CascadeSelect from "primevue/cascadeselect";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import SvgIcon from "@/shared/ui/SvgIcon.vue";

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

const isDarkMode = computed(() => store.getters.getSettings?.darkMode ?? false);
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

.logo-button {
  opacity: 0.5;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

.sticky {
  position: fixed;
  top: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .dark & {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  }
}

#explorer {
  width: 100vw;
  max-width: 100%;
  z-index: 1000;
  box-sizing: border-box;
  @apply dark:bg-surface-900 bg-white;
}
</style>
