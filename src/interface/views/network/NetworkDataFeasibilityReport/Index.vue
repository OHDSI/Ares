<template>
  <v-responsive min-width="900">
    <DomainRequirements
      :data="sources"
      @domainsDataChanged="changeDomainData"
    />
    <Range :data="observationPeriod" @rangeDataChanged="changeRangeData" />
    <VisitTypes
      :data="domainSummary"
      @visitTypesChanged="changeVisitTypesData"
    />
    <RequiredConcepts @overlappingDataChanged="changeRequiredConceptsData" />
    <FinalEstimation :data="finalEstimation" />
  </v-responsive>
</template>

<script>
import { csvParse } from "d3-dsv";

import {
  DENSITY_DOMAIN_PERSON,
  DOMAIN_SUMMARY,
  OBSERVATION_PERIOD,
  PERSON,
} from "@/data/services/getFilePath";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import { mapGetters } from "vuex";
import DomainRequirements from "@/interface/views/network/NetworkDataFeasibilityReport/DomainRequirements";
import Range from "@/interface/views/network/NetworkDataFeasibilityReport/Range";
import VisitTypes from "@/interface/views/network/NetworkDataFeasibilityReport/VisitTypes";
import RequiredConcepts from "@/interface/views/network/NetworkDataFeasibilityReport/RequiredConcepts";
import FinalEstimation from "@/interface/views/network/NetworkDataFeasibilityReport/FinalEstimation";

export default {
  name: "NetworkDataFeasibility",
  components: {
    FinalEstimation,
    RequiredConcepts,
    VisitTypes,
    Range,
    DomainRequirements,
  },
  data() {
    return {
      sources: [],
      switchDomains: [],
      chosenDomains: [],
      rangeData: [],
      requiredConcepts: {},
      visitTypes: [],
      domainData: [],
      observationPeriod: [],
      person: [],
      domainSummary: [],
      dataLoaded: false,
    };
  },
  computed: {
    ...mapGetters(["getData"]),
    finalEstimation: function () {
      return {
        domainData: this.chosenDomains,
        rangeData: this.rangeData,
        requiredConcepts: this.requiredConcepts,
        visitTypes: this.visitTypes,
        sourcePopulation: this.person,
      };
    },
  },
  created() {
    this.load();
  },
  methods: {
    load: function () {
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [
            OBSERVATION_PERIOD,
            PERSON,
            DENSITY_DOMAIN_PERSON,
            DOMAIN_SUMMARY,
          ],
          params: { domain: "visit_occurrence" },
        })
        .then(() => {
          this.observationPeriod = this.getData[OBSERVATION_PERIOD];
          this.person = this.getData[PERSON];
          this.sources = this.getData[DENSITY_DOMAIN_PERSON].map((file) => ({
            data: csvParse(file.data),
            source: file.source.cdm_source_abbreviation,
          }));
          this.domainSummary = this.getData[DOMAIN_SUMMARY].map((file) => ({
            data: csvParse(file.data),
            source: file.source.cdm_source_abbreviation,
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
  },
};
</script>

<style scoped></style>
