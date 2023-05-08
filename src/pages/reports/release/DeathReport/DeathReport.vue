<template>
  <div>
    <v-container v-if="!store.getters.getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Death Report</div>
        <AgeAtDeath />
        <DeathByType />
        <RecordCountProportionByAgeSexYear />
        <RecordCountProportionByMonth />
      </v-responsive>
      <form-dialog
        @close="store.commit(SET_DIALOG, false)"
        :show="store.getters.getDialogData.show"
        :action="store.getters.getDialogData.action"
        :data="store.getters.getDialogData.data"
        :form-title="'Edit selection'"
      />
    </v-container>
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
import FormDialog from "@/widgets/newNoteDialog/formDialog.vue";

const route = useRoute();
const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
