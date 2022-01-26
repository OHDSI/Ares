<template>
  <div v-if="!getErrors">
    <v-container>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-1 text-uppercase text-h6"
          >Data Source Release Comparison
        </v-layout>
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">{{ conceptName }}</h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="dataLoaded" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p></v-col
          ></v-row
        >
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="conceptData"
            title="Record Proportion by Month"
          />
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import { flatten, sumBy } from "lodash";
import * as d3Format from "d3-format";
import * as d3 from "d3-time-format";
import ReturnButton from "@/interface/components/ReturnButton";
import { charts } from "@/configs";
import { FETCH_MULTIPLE_FILES_BY_RELEASE } from "@/data/store/modules/view/actions.type";
import { SOURCE_CONCEPT } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
export default {
  components: {
    VegaChart,
    ReturnButton,
  },
  data() {
    return {
      sources: [],
      conceptData: [],
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      cdmSourceName: "",
      specRecordProportionByMonth: charts.specRecordProportionByMonthByRelease,
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
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    load() {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_RELEASE, {
          files: [SOURCE_CONCEPT],
        })
        .then(() => {
          if (!this.getErrors) {
            const parsedResponses = this.getData[SOURCE_CONCEPT];
            const dateParse = d3.timeParse("%Y%m");

            if (!parsedResponses.length) return;

            this.conceptName = parsedResponses[0].data.CONCEPT_NAME[0];
            this.conceptId = parsedResponses[0].data.CONCEPT_ID[0];
            this.numPersons = sumBy(
              parsedResponses,
              (item) => item.data.NUM_PERSONS[0]
            );

            const prevalence = parsedResponses.map((response) =>
              response.data.PREVALENCE_BY_MONTH.map((prevalence) => {
                return {
                  ...prevalence,
                  date: dateParse(prevalence.X_CALENDAR_MONTH),
                  release: response.release,
                };
              })
            );

            this.conceptData = flatten(prevalence);
            this.dataLoaded = true;
          }
        });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
