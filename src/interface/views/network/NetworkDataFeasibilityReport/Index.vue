<template>
  <v-responsive min-width="900">
    <v-card elevation="10" class="ma-4" pa-2>
      <v-container>
        <v-expansion-panels v-model="panel" multiple>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-header class="text-lg-h6"
              >Domain Requirements</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <DomainRequirements
                :data="sources"
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
                :data="sources"
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
                :observation-period="observationPeriod"
                :person="person"
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
                :data="domainSummary"
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
      </v-container>
    </v-card>
  </v-responsive>
</template>

<script>
import { csvParse } from "d3-dsv";

import {
  DENSITY_DOMAIN_PERSON,
  DOMAIN_SUMMARY,
  OBSERVATION_PERIOD,
  PERSON
} from "@/data/services/getFilePath";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
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
    DomainRequirements
  },
  data() {
    return {
      sources: [],
      switchDomains: [],
      chosenDomains: [],
      rangeData: [],
      desiredDomains: [],
      panel: [0],
      requiredConcepts: [],
      visitTypes: [],
      domainData: [],
      observationPeriod: [],
      person: [],
      domainSummary: [],
      dataLoaded: false
    };
  },
  computed: {
    ...mapGetters(["getData"]),
    finalEstimation: function() {
      return {
        domainData: this.chosenDomains,
        rangeData: this.rangeData,
        requiredConcepts: this.requiredConcepts,
        visitTypes: this.visitTypes,
        sourcePopulation: this.person,
        desiredDomains: this.desiredDomains
      };
    }
  },
  created() {
    this.load();
  },
  methods: {
    load: function() {
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [
            OBSERVATION_PERIOD,
            PERSON,
            DENSITY_DOMAIN_PERSON,
            DOMAIN_SUMMARY
          ],
          params: { domain: "visit_occurrence" }
        })
        .then(() => {
          this.observationPeriod = this.getData[OBSERVATION_PERIOD];
          this.person = this.getData[PERSON];
          this.sources = this.getData[DENSITY_DOMAIN_PERSON].map(file => ({
            data: csvParse(file.data),
            source: file.source.cdm_source_abbreviation
          }));
          this.domainSummary = this.getData[DOMAIN_SUMMARY].map(file => ({
            data: csvParse(file.data),
            source: file.source.cdm_source_abbreviation
          }));
        });
    },
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
    }
  }
};
</script>

<style scoped></style>
