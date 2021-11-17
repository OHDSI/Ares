import Vue from "vue";
import VueRouter from "vue-router";

import App from "../App";
import help from "../components/Help.vue";
import dataQualityResults from "../components/DataQualityResults.vue";
import dataQualityHistory from "../components/DataQualityHistory.vue";
import networkOverview from "../components/NetworkOverview.vue";
import domainDensity from "../components/DomainDensity.vue";
import domainTable from "../components/DomainTable.vue";
import domainContinuity from "../components/DomainContinuity.vue";
import conceptReport from "../components/ConceptReport.vue";
import personReport from "../components/PersonReport.vue";
import performanceReport from "../components/PerformanceTable.vue";
import networkDataQualitySummary from "../components/NetworkDataQualitySummary.vue";
import networkPopulationReport from "../components/NetworkPopulationReport.vue";
import networkConceptReport from "../components/NetworkConceptReport.vue";
import networkDatastrandReport from "../components/NetworkDatastrandReport.vue";
import observationPeriodReport from "../components/ObservationPeriodReport.vue";
import sourceConceptReport from "../components/SourceConceptReport.vue";
import deathReport from "../components/DeathReport.vue";
import metadataReport from "../components/MetadataReport.vue";
import home from "../components/Home.vue";
import article from "../components/Article.vue";
import unmappedSourceCodes from "../components/UnmappedSourceCodes.vue";
import ExplorerWrapper from "../components/ExplorerWrapper";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    components: [App],
    redirect: "/home",
    meta: { showModules: true },
  },
  { path: "/home", components: { main: home } },
  { path: "/help", components: { main: help } },

  {
    path: "/network",
    name: "network",
    components: {main: ExplorerWrapper},
    redirect: {name: "overview"},
    children: [
      {
        path: "network_data_quality",
        name: "networkDataQuality",
        components: {ExplorerWrapper: networkDataQualitySummary}
      },
      {
        path: "data_strand_report",
        name: "dataStrandReport",
        components: {ExplorerWrapper: networkDatastrandReport}
      },
      {
        path: "population",
        name: "population",
        components: {ExplorerWrapper: networkPopulationReport}
      },
      {
        path: "overview",
        name: "overview",
        components: {ExplorerWrapper: networkOverview}
      },
      {
        path: "concept/:domain/:concept/summary",
        name: "concept",
        components: {ExplorerWrapper: networkConceptReport}
      },
    ]
  },

  {
    path: "/cdm/:cdm/:release",
    name: "cdm",
    components: {main: ExplorerWrapper},
    redirect: {name: "person"},
    children: [
      {
        path: "observation_period",
        name: "observationPeriod",
        components: {ExplorerWrapper: observationPeriodReport}
      },
      {
        path: "metadata",
        name: "metadata",
        components: {ExplorerWrapper: metadataReport}
      },
      {
        path: "death",
        name: "death",
        components: {ExplorerWrapper: deathReport}
      },
      {
        path: "data_quality",
        name: "dataQuality",
        components: {ExplorerWrapper: dataQualityResults}
      },
      {
        path: "data_density",
        name: "dataDensity",
        components: {ExplorerWrapper: domainDensity}
      },
      {
        path: "unmapped_source_codes",
        name: "unmappedSourceCodes",
        components: {ExplorerWrapper: unmappedSourceCodes}
      },
      {
        path: "performance",
        name: "performance",
        components: {ExplorerWrapper: performanceReport}
      },
      {
        path: "person",
        name: "person",
        components: {ExplorerWrapper: personReport}
      },
      {
        path: ":domain",
        components: {ExplorerWrapper: domainTable},
        name: "domainTable",
      },
      {
        path: ":domain/:concept/",
        components: { ExplorerWrapper: conceptReport },
      },
    ]
  },
  {
    path: "/datasource/:cdm",
    name: "datasource",
    components: {main: ExplorerWrapper},
    redirect: {name: "dataQualityHistory"},
    children: [
      {
        path: "data_quality_history",
        name: "dataQualityHistory",
        components: {ExplorerWrapper: dataQualityHistory}
      },
      {
        path: "domain_continuity",
        name: "domainContinuity",
        components: {ExplorerWrapper: domainContinuity}
      },
      {
        path: ":domain/:concept/overlay",
        name: "sourceConceptOverlay",
        components: {ExplorerWrapper: sourceConceptReport}
      },
    ]
  },

  {
    path: "/publication/article",
    components: { main: article },
  },
];

export default new VueRouter({
  base: "/ares/",
  routes,
});
