<template>
  <div>
    <v-container v-if="!getErrors">
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
              :content="formatComma(numPersons)"
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
                formatComma(genderMaleCount) +
                ' (' +
                formatPercent(genderMalePct) +
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
                formatComma(genderFemaleCount) +
                ' (' +
                formatPercent(genderFemalePct) +
                ')'
              "
            ></v-badge>
            <p class="text-caption">Gender Proportions</p>
          </v-col>
        </v-row>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-populationbyageandsex"
            title="Population by Age &amp; Sex"
            :data="personData.AGE_GENDER_DATA"
            :config="specAgeSex"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-race"
            :config="specRace"
            :data="personData.RACE_DATA"
            title="Population by Race"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-birthyear"
            :config="specBirthYear"
            :data="personData.BIRTH_YEAR_DATA"
            title="Population by Year of Birth"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-ethnicity"
            :config="specEthnicity"
            :data="personData.ETHNICITY_DATA"
            title="Population by Ethnicity"
          />
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3 from "d3-time-format";
import * as d3Format from "d3-format";
import { charts } from "@/configs";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { METADATA, PERSON } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
export default {
  components: {
    VegaChart,
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
      dataLoaded: false,
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
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    // Formats values passed as percentages
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    // Formats values passed with commas added
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },

    load: function () {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_FILES, {
          files: [{ name: PERSON, required: true }],
        })
        .then(() => {
          if (!this.getErrors) {
            const dateParse = d3.timeParse("%Y");
            this.personData = this.getData[PERSON];
            this.numPersons = this.personData.SUMMARY[1].ATTRIBUTE_VALUE;
            if (this.personData.GENDER_DATA[0].CONCEPT_NAME === "MALE") {
              this.genderMaleCount = this.personData.GENDER_DATA[0].COUNT_VALUE;
              this.genderFemaleCount =
                this.personData.GENDER_DATA[1].COUNT_VALUE;
            } else {
              this.genderMaleCount = this.personData.GENDER_DATA[1].COUNT_VALUE;
              this.genderFemaleCount =
                this.personData.GENDER_DATA[0].COUNT_VALUE;
            }
            // Gender breakdown (percentage)
            this.genderMalePct = this.genderMaleCount / this.numPersons;
            this.genderFemalePct = this.genderFemaleCount / this.numPersons;

            this.personData.BIRTH_YEAR_DATA.forEach((v, i) => {
              this.personData.BIRTH_YEAR_DATA[i].YEAR = dateParse(v.YEAR);
            });
            this.dataLoaded = true;
          }
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
