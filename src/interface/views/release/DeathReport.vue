<template>
  <div>
    <v-container v-if="!getErrors">
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Death Report</div>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-ageatdeath"
            title="Age at Death"
            :config="specAgeAtDeath"
            :data="deathData.AGE_AT_DEATH"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-deathbytype"
            title="Death By Type"
            :config="specDeathByType"
            :data="deathData.DEATH_BY_TYPE"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-recordproportionbyagesexyear"
            :config="specRecordProportionByAgeSexYear"
            :data="deathData.PREVALENCE_BY_GENDER_AGE_YEAR"
            title="Record Count Proportion by Age, Sex, and Year"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="deathData.PREVALENCE_BY_MONTH"
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
import * as d3 from "d3-time-format";
import { charts } from "@/configs";
import { FETCH_DATA } from "@/data/store/modules/view/actions.type";
import { DEATH } from "@/data/services/getFilePath";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";
import sortByRange from "@/services/range-sort";
export default {
  components: {
    VegaChart,
  },
  data() {
    return {
      deathData: null,
      dataLoaded: false,
      specDeathByType: charts.specDeathByType,
      specAgeAtDeath: charts.specAgeAtDeath,
      specRecordProportionByAgeSexYear: charts.specRecordProportionByAgeSexYear,
      specRecordProportionByMonth: charts.specRecordProportionByMonth,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    load: function () {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_DATA, {
          files: [{ name: DEATH, required: true }],
        })
        .then(() => {
          const dateParse = d3.timeParse("%Y%m");
          this.deathData = this.getData[DEATH];
          this.deathData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
            this.deathData.PREVALENCE_BY_GENDER_AGE_YEAR,
            "ascending",
            "TRELLIS_NAME",
            "trellisOrder"
          );
          this.deathData.PREVALENCE_BY_MONTH.forEach((v, i) => {
            this.deathData.PREVALENCE_BY_MONTH[i].date = dateParse(
              v.X_CALENDAR_MONTH
            );
          });
          this.dataLoaded = true;
        });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
