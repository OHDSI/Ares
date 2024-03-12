<template>
  <div v-if="!store.getters.getErrors" fluid>
    <div class="flex flex-col gap-10">
      <PageHeader title="Death Report" />
      <div class="flex flex-col gap-5">
        <AgeAtDeath />
        <DeathByType />
        <RecordCountProportionByAgeSexYear />
        <RecordCountProportionByMonth />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import AgeAtDeath from "@/pages/reports/release/DeathReport/charts/AgeAtDeath/AgeAtDeath.vue";
import DeathByType from "@/pages/reports/release/DeathReport/charts/DeathByType/DeathByType.vue";
import RecordCountProportionByAgeSexYear from "@/pages/reports/release/DeathReport/charts/RecordCountProportionByAgeSexYear/RecordCountProportionByAgeSexYear.vue";
import RecordCountProportionByMonth from "@/pages/reports/release/DeathReport/charts/RecordCountProportionByMonth/RecordCountProportionByMonth.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";

const route = useRoute();
const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
