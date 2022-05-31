<template>
  <div v-if="!getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-1 text-uppercase text-h6"
          >Data Source Release Comparison
        </v-layout>
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">{{ getData.conceptName }}</h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="getData" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p></v-col
          ></v-row
        >
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="getData"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="getData.conceptData"
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
      specRecordProportionByMonth: charts.specRecordProportionByMonthByRelease,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },
};
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
