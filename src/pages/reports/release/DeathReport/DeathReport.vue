<template>
  <div>
    <v-container v-if="!store.getters.getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Death Report</div>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ageatdeath"
            width="100"
            title="Age at Death"
            :config="chartConfigs.specAgeAtDeath"
            :data="store.getters.getData.AGE_AT_DEATH"
          />
          <infopanel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.name.toUpperCase()]
                  .AGE_AT_DEATH[0]
              )
            "
            :divider="true"
          ></infopanel>
        </v-card>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-deathbytype"
            width="100"
            title="Death By Type"
            :config="chartConfigs.specDeathByType"
            :data="store.getters.getData.DEATH_BY_TYPE"
          />
          <infopanel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.name.toUpperCase()]
                  .DEATH_BY_TYPE[0]
              )
            "
            :divider="true"
          ></infopanel>
        </v-card>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-recordproportionbyagesexyear"
            width="90"
            :config="chartConfigs.specRecordProportionByAgeSexYear"
            :data="store.getters.getData.PREVALENCE_BY_GENDER_AGE_YEAR"
            title="Record Count Proportion by Age, Sex, and Year"
          />
          <infopanel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.name.toUpperCase()]
                  .PREVALENCE_BY_GENDER_AGE_YEAR[0]
              )
            "
            :divider="true"
          ></infopanel>
        </v-card>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-recordproportionbymonth"
            width="90"
            :config="chartConfigs.specRecordProportionByMonth"
            :data="store.getters.getData.PREVALENCE_BY_MONTH"
            title="Record Count Proportion by Month"
          />
          <infopanel
            details="Proportion of people with at least one record per 1000 people."
            :divider="true"
          ></infopanel>
          <infopanel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.name.toUpperCase()]
                  .PREVALENCE_BY_MONTH[0]
              )
            "
            :divider="false"
          ></infopanel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Infopanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";

const route = useRoute();
const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
