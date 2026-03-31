<template>
  <div v-if="!store.getters.getErrors" class="flex flex-col gap-10">
    <PageHeader title="Domain Table" />
    <div class="flex flex-col gap-5">
      <MainTable @openDrilldown="openDrilldownView" />
      <DomainMetadataTable :data="store.getters.getData.metadataData" />
      <DataStratificationByVisit />
      <DataStratificationByDrug />

      <div class="card flex justify-content-center">
        <Sidebar
          @hide="closeDrillDown"
          header="Concept Report"
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
            <ConceptReport v-if="conceptData" :data="conceptData" />
            <div class="flex justify-center items-center h-full" v-else>
              <!--              <AnimatedLogo />-->
              <BlackHoleLoading size="lg" :state="drilldownLoaderState" />
            </div>
          </div>
        </Sidebar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import MainTable from "@/pages/reports/release/DomainTable/components/MainTable.vue";
import DataStratificationByVisit from "@/pages/reports/release/DomainTable/components/DataStratificationByVisit/DataStratificationByVisit.vue";
import DataStratificationByDrug from "@/pages/reports/release/DomainTable/components/DataStratificationByDrug/DataStratificationByDrug.vue";
import DomainMetadataTable from "@/pages/reports/release/DomainTable/components/DomainMetadataTable.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import Sidebar from "primevue/sidebar";
import ConceptReport from "@/pages/reports/release/DomainTable/components/ConceptReport/ConceptReport.vue";
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import environment from "@/shared/api/environment";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import { CONCEPT, DOMAIN_SUMMARY } from "@/shared/config/files";
import { FETCH_FILES } from "@/processes/exploreReports/model/store/actions.type";
import AnimatedLogo from "@/shared/assets/AnimatedLogo.vue";
import BlackHoleLoading from "@/shared/assets/BlackHoleLoading.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const defaultSources = computed(() => {
  return store.getters.getSettings.defaultSources || {};
});

const openedDomain = computed(() => route.params.domain);

const conceptData = ref(null);
const drilldownLoaderState = ref("idle");

const drillDownViewOption = computed(
  () => store.getters.getSettings.drillDownViewOptions
);

async function loadDrilldown(concept) {
  const conceptId = concept.CONCEPT_ID;
  visible.value = true;
  conceptData.value = null;
  drilldownLoaderState.value = "loading";
  const loadStart = Date.now();
  router.replace({ name: "domainTable", params: { concept: conceptId } });
  const domain = openedDomain.value;
  const duckdbTables = getDuckDBTables({
    domain,
    concept: conceptId,
  })[domain];
  const jsonConcepts = [
    {
      name: CONCEPT,
    },
    { name: DOMAIN_SUMMARY, required: true },
  ];

  const files = environment.DUCKDB_ENABLED ? duckdbTables : jsonConcepts;
  try {
    await store.dispatch(FETCH_FILES, {
      files: files,
      duckdb_supported: true,
      params: {
        domain,
        concept: conceptId,
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

const closeDrillDown = function () {
  conceptData.value = null;
};

const visible = ref(false);

watch(visible, () => {
  if (visible.value === false)
    if (route.params.concept) {
      router.replace({ name: route.name });
    }
});

if (route.params.concept && route.params.domain) {
  loadDrilldown({ CONCEPT_ID: route.params.concept });
}

async function openDrilldownView(concept) {
  await loadDrilldown(concept);
}
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
