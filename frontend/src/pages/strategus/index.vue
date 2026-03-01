<template>
  <TabView @update:activeIndex="setCurrentTab" :active-index="getCurrentTab">
    <TabPanel header="Data Sources"> <DataSources /> </TabPanel>
    <TabPanel header="Characterization"> <Characterization /> </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

import About from "@/pages/strategus/About.vue";
import DataSources from "@/pages/strategus/DataSources.vue";
import Characterization from "@/pages/strategus/characterization/Characterization.vue";
import PatientPrediction from "@/pages/strategus/PatientPrediction.vue";

const router = useRouter();
const route = useRoute();

const getCurrentTab = computed(() => {
  return parseInt(route.query.tab) || 0;
});

const setCurrentTab = function (val) {
  router.push({
    query: {
      tab: val,
    },
  });
};
//main view: vertical or horizontal tabs
</script>

<style scoped></style>
