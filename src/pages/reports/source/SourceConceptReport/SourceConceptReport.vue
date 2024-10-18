<template>
  <div class="flex flex-col gap-10" v-if="!store.getters.getErrors">
    <PageHeader
      :title="`Data Source Release Comparison for ${store.getters.getData.conceptName}`"
    >
      <template> <ReturnButton /> </template>
    </PageHeader>
    <InfoPanel
      :concept="store.getters.getData.conceptId"
      :population="store.getters.getData.numPersons"
    />
    <RecordProportionByMonth />
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";
import { useStore } from "vuex";
import RecordProportionByMonth from "@/pages/reports/source/SourceConceptReport/charts/recordProportionByMonth/RecordProportionByMonth.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import InfoPanel from "@/widgets/infoPanel";
const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
