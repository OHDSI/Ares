<template>
  <div>
    <v-container v-if="!getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Death Report</div>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-ageatdeath"
            title="Age at Death"
            :config="specAgeAtDeath"
            :data="getData.AGE_AT_DEATH"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.name.toUpperCase()].AGE_AT_DEATH[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-deathbytype"
            title="Death By Type"
            :config="specDeathByType"
            :data="getData.DEATH_BY_TYPE"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.name.toUpperCase()].DEATH_BY_TYPE[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-recordproportionbyagesexyear"
            :config="specRecordProportionByAgeSexYear"
            :data="getData.PREVALENCE_BY_GENDER_AGE_YEAR"
            title="Record Count Proportion by Age, Sex, and Year"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.name.toUpperCase()]
                  .PREVALENCE_BY_GENDER_AGE_YEAR[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="getData.PREVALENCE_BY_MONTH"
            title="Record Count Proportion by Month"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.name.toUpperCase()].PREVALENCE_BY_MONTH[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import { charts } from "@/configs";
import infoPanel from "@/interface/components/InfoPanel";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";
export default {
  components: {
    VegaChart,
    infoPanel,
  },
  data() {
    return {
      specDeathByType: charts.specDeathByType,
      specAgeAtDeath: charts.specAgeAtDeath,
      specRecordProportionByAgeSexYear: charts.specRecordProportionByAgeSexYear,
      specRecordProportionByMonth: charts.specRecordProportionByMonth,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
  },
  watch: {},
  methods: {
    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
