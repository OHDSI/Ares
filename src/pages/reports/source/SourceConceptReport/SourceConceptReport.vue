<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-1 text-uppercase text-h6"
          >Data Source Release Comparison
        </v-layout>
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">
            {{ store.getters.getData.conceptName }}
          </h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="store.getters.getData" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="store.getters.getData.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="store.getters.getData.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p></v-col
          ></v-row
        >
        <RecordProportionByMonth />
      </v-responsive>
      <form-dialog
        @close="store.commit(SET_DIALOG, false)"
        v-if="store.getters.getDialogData.show"
        :show="store.getters.getDialogData.show"
        :action="store.getters.getDialogData.action"
        :data="store.getters.getDialogData.data"
        :form-title="'Edit selection'"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";
import { useStore } from "vuex";
import RecordProportionByMonth from "@/pages/reports/source/SourceConceptReport/charts/recordProportionByMonth/RecordProportionByMonth.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";
const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
