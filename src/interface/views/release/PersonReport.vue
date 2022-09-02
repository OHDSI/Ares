<template>
  <div>
    <v-container v-if="!getErrors && dataInStore" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Person Report</div>
        <br />
        <v-row>
          <!-- Total persons in top bar -->
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="formatComma(getData.numPersons)"
            ></v-badge>
            <p class="text-caption">Number of People</p>
          </v-col>
          <!-- Gender breakdown in top bar -->
          <v-col cols="4" align="center">
            <v-icon left color="info">mdi-human-male-female</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="
                'Male: ' +
                formatComma(getData.genderMaleCount) +
                ' (' +
                formatPercent(getData.genderMalePct) +
                ')'
              "
            ></v-badge>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="
                'Female: ' +
                formatComma(getData.genderFemaleCount) +
                ' (' +
                formatPercent(getData.genderFemalePct) +
                ')'
              "
            ></v-badge>
            <p class="text-caption">Proportion by Sex</p>
          </v-col>
        </v-row>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-populationbyageandsex"
            title="Population by Age &amp; Sex"
            :data="getData.personData.AGE_GENDER_DATA"
            :config="specAgeSex"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="getQueryLink(getQueryIndex.PERSON.AGE_GENDER_DATA)"
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-race"
            :config="specRace"
            :data="getData.personData.RACE_DATA"
            title="Population by Race"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="getQueryLink(getQueryIndex.PERSON.RACE_DATA)"
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-birthyear"
            :config="specBirthYear"
            :data="getData.personData.BIRTH_YEAR_DATA"
            title="Population by Year of Birth"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="getQueryLink(getQueryIndex.PERSON.BIRTH_YEAR_DATA)"
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-ethnicity"
            :config="specEthnicity"
            :data="getData.personData.ETHNICITY_DATA"
            title="Population by Ethnicity"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="getQueryLink(getQueryIndex.PERSON.ETHNICITY_DATA)"
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3Format from "d3-format";
import { charts } from "@/configs";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
import infoPanel from "@/interface/components/InfoPanel";
export default {
  components: {
    VegaChart,
    infoPanel,
  },
  data() {
    return {
      personData: "",
      hasMeasurementValueDistribution: false,
      hasAgeAtFirstDiagnosis: false,
      hasAgeAtFirstOccurrence: false,
      conceptData: null,
      conceptName: "",
      conceptId: 0,
      historyRecords: [],
      cdmSourceName: "",
      numPersons: "",
      genderMaleCount: "",
      genderMalePct: "",
      genderFemalePct: "",
      genderFemaleCount: "",
      specBirthYear: charts.specBirthYear,
      specRace: charts.specRace,
      specEthnicity: charts.specEthnicity,
      specAgeSex: charts.specAgeSex,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
  },
  methods: {
    // Formats values passed as percentages
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },

    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
    },
    // Formats values passed with commas added
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
.v-tooltip__content {
  pointer-events: initial;
}
.query-link {
  color: white;
}
</style>
