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
        <v-card
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.getData"
            id="viz-recordproportionbymonth"
            :config="chartConfigs.specRecordProportionByMonth"
            :data="store.getters.getData.conceptData"
            width="99"
            title="Record Proportion by Month"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_MONTH[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";
import { chartConfigs, Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const route = useRoute();
const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
