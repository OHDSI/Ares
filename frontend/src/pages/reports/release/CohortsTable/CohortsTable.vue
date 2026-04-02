<template>
  <div v-if="!store.getters.getErrors" class="flex flex-col gap-5">
    <MainTable @openDrilldown="openDrilldownView" />
    <div class="card flex justify-content-center">
      <Sidebar
        @hide="closeDrillDown"
        header="Cohort Report"
        :pt="{
          header: [
            'flex',
            'flex-row justify-between',
            'px-14',
            'md:px-20',
            'lg:px-24',
            'mx-6',
            'my-5',
          ],
        }"
        v-model:visible="visible"
        :position="drillDownViewOption?.position"
        :class="drillDownViewOption?.class"
      >
        <div class="px-14 md:px-20 lg:px-24 mx-1 h-[90%]">
          <CohortDrilldownReport v-if="conceptData" :data="conceptData" />
          <div class="flex justify-center items-center h-full" v-else>
            <!--            <AnimatedLogo />-->
            <BlackHoleLoading
              text="Fetching..."
              size="lg"
              :state="drilldownLoaderState"
            />
          </div>
        </div>
      </Sidebar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import MainTable from "./components/CohortsIndex.vue";
import Sidebar from "primevue/sidebar";
import AnimatedLogo from "@/shared/assets/AnimatedLogo.vue";
import { computed, onMounted, ref, watch } from "vue";
import {
  COHORT_CHARACTERIZATION,
  COHORT_INDEX_EVENT_BREAKDOWN,
  COHORT_TEMPORAL_COVARIATE_DISTRIBUTION,
} from "@/shared/config/files";
import { FETCH_FILES } from "@/processes/exploreReports/model/store/actions.type";
import { useRoute, useRouter } from "vue-router";
import CohortDrilldownReport from "@/pages/reports/release/CohortsTable/components/CohortDrilldownReport/CohortDrilldownReport.vue";
import BlackHoleLoading from "@/shared/assets/BlackHoleLoading.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

const visible = ref(false);

watch(visible, () => {
  if (visible.value === false)
    if (route.params.concept) {
      router.replace({ name: route.name });
    }
});

const drillDownViewOption = computed(
  () => store.getters.getSettings.drillDownViewOptions
);

const conceptData = ref(null);
const drilldownLoaderState = ref("idle");

const closeDrillDown = function () {
  conceptData.value = null;
};

const defaultSources = computed(() => {
  return store.getters.getSettings.defaultSources || {};
});

async function loadDrilldown(concept) {
  const cohort_id = concept.cohort_id;
  visible.value = true;
  conceptData.value = null;
  drilldownLoaderState.value = "loading";
  const loadStart = Date.now();
  if (!route.params.cohort_id) {
    router.replace({ name: "cohorts", params: { cohort_id } });
  }

  const jsonConcepts = [
    { name: COHORT_CHARACTERIZATION, required: true },
    { name: COHORT_INDEX_EVENT_BREAKDOWN, required: true },
    { name: COHORT_TEMPORAL_COVARIATE_DISTRIBUTION, required: true },
  ];

  const files = jsonConcepts;
  try {
    await store.dispatch(FETCH_FILES, {
      files: files,
      duckdb_supported: true,
      params: {
        cohort_id,
      },
      defaultSources: defaultSources.value,
    });
    if (Date.now() - loadStart >= 600) {
      drilldownLoaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    drilldownLoaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    conceptData.value = store.getters.getData;
  } catch {
    drilldownLoaderState.value = "error";
  }
}

async function openDrilldownView(concept) {
  await loadDrilldown(concept);
}

watch(visible, () => {
  if (visible.value === false)
    if (route.params.cohort_id) {
      router.replace({ name: route.name });
    }
});

onMounted(() => {
  const cohort_id = route.params.cohort_id;
  if (cohort_id) {
    openDrilldownView(cohort_id);
  }
});
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.viz-container {
  width: 90%;
}
</style>
