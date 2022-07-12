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
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-deathbytype"
            title="Death By Type"
            :config="specDeathByType"
            :data="getData.DEATH_BY_TYPE"
          />
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-recordproportionbyagesexyear"
            :config="specRecordProportionByAgeSexYear"
            :data="getData.PREVALENCE_BY_GENDER_AGE_YEAR"
            title="Record Count Proportion by Age, Sex, and Year"
          />
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="getData.PREVALENCE_BY_MONTH"
            title="Record Count Proportion by Month"
          />
          <v-card-text>
            <v-layout align-baseline>
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Proportion of people with at least one record per 1000 people.
            </v-layout>
          </v-card-text>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import { charts } from "@/configs";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { DEATH } from "@/data/services/getFilePath";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";
export default {
  components: {
    VegaChart,
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
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
  },
  watch: {},
  methods: {},
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
