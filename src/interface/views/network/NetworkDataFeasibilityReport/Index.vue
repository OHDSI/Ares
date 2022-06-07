<template>
  <v-container fluid min-width="900">
    <v-card elevation="10" class="ma-4" pa-2>
      <v-responsive>
        <v-expansion-panels v-model="panel" multiple>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Domain Requirements</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <DomainRequirements
                :data="loadedData.sources"
                @domainsDataChanged="changeDomainData"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Desired Domains</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <DesiredDomains
                :data="loadedData.sources"
                @desiredDomainsDataChanged="changeDesiredDomainsData"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Range requirements</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <Range
                :observation-period="loadedData.observationPeriod"
                :person="loadedData.person"
                @rangeDataChanged="changeRangeData"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Visit types requirements</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <VisitTypes
                :data="loadedData.domainSummary"
                @visitTypesChanged="changeVisitTypesData"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Concepts requirements</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <RequiredConcepts
                @overlappingDataChanged="changeRequiredConceptsData"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Data Source Feasibility Overview</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <FinalEstimation :data="finalEstimation" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-responsive>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import DomainRequirements from "@/interface/views/network/NetworkDataFeasibilityReport/DomainRequirements";
import Range from "@/interface/views/network/NetworkDataFeasibilityReport/Range";
import VisitTypes from "@/interface/views/network/NetworkDataFeasibilityReport/VisitTypes";
import RequiredConcepts from "@/interface/views/network/NetworkDataFeasibilityReport/RequiredConcepts";
import FinalEstimation from "@/interface/views/network/NetworkDataFeasibilityReport/FinalEstimation";
import DesiredDomains from "@/interface/views/network/NetworkDataFeasibilityReport/DesiredDomains";

export default {
  name: "NetworkDataFeasibility",
  components: {
    DesiredDomains,
    FinalEstimation,
    RequiredConcepts,
    VisitTypes,
    Range,
    DomainRequirements,
  },
  data() {
    return {
      sources: [],
      domainSummary: [],
      observationPeriod: [],
      sourcePopulation: [],
      person: [],
      loadedData: {},
      switchDomains: [],
      chosenDomains: [],
      rangeData: [],
      desiredDomains: [],
      panel: [0],
      requiredConcepts: [],
      visitTypes: [],
      domainData: [],
      dataLoaded: false,
    };
  },
  computed: {
    ...mapGetters(["getData", "explorerLoaded"]),
    finalEstimation: function () {
      return {
        domainData: this.chosenDomains,
        rangeData: this.rangeData,
        requiredConcepts: this.requiredConcepts,
        visitTypes: this.visitTypes,
        sourcePopulation: this.loadedData.person,
        desiredDomains: this.desiredDomains,
      };
    },
  },

  watch: {
    getData: function () {
      if (Object.keys(this.getData).length) {
        if (!Object.keys(this.loadedData).length) {
          this.loadedData = {
            sources: this.getData.sources,
            person: this.getData.person,
            domainSummary: this.getData.domainSummary,
            observationPeriod: this.getData.observationPeriod,
          };
        }
      }
    },
  },
  created() {},
  methods: {
    changeDomainData(value) {
      this.chosenDomains = value;
    },
    changeRangeData(value) {
      this.rangeData = value;
    },
    changeRequiredConceptsData(value) {
      this.requiredConcepts = value;
    },
    changeVisitTypesData(value) {
      this.visitTypes = value;
    },
    changeDesiredDomainsData(value) {
      this.desiredDomains = value;
    },
  },
};
</script>

<style scoped></style>
