import Vue from "vue";
import VueRouter from "vue-router";

import App from "../App";
import help from "../interface/views/Help.vue";
import dataQualityResults from "../interface/views/release/DataQualityResults.vue";
import dataQualityHistory from "../interface/views/source/DataQualityHistory.vue";
import networkOverview from "../interface/views/network/NetworkOverview.vue";
import domainDensity from "../interface/views/release/DomainDensity.vue";
import domainTable from "../interface/views/release/DomainTable.vue";
import domainContinuity from "../interface/views/source/DomainContinuity.vue";
import conceptReport from "../interface/views/release/ConceptReport.vue";
import personReport from "../interface/views/release/PersonReport.vue";
import performanceReport from "../interface/views/release/PerformanceTable.vue";
import networkDataQualitySummary from "../interface/views/network/NetworkDataQualitySummary.vue";
import networkPopulationReport from "../interface/views/network/NetworkPopulationReport.vue";
import networkConceptReport from "../interface/views/network/NetworkConceptReport.vue";
import networkDatastrandReport from "../interface/views/network/NetworkDatastrandReport.vue";
import observationPeriodReport from "../interface/views/release/ObservationPeriodReport.vue";
import sourceConceptReport from "../interface/views/source/SourceConceptReport.vue";
import deathReport from "../interface/views/release/DeathReport.vue";
import metadataReport from "../interface/views/release/MetadataReport.vue";
import home from "../interface/views/Home.vue";
import article from "../interface/views/Article.vue";
import unmappedSourceCodes from "../interface/views/release/UnmappedSourceCodes.vue";
import ExplorerWrapper from "../interface/views/ExplorerWrapper";

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
    components: { main: ExplorerWrapper },
    redirect: { name: "overview" },
    children: [
      {
        path: "network_data_quality",
        name: "networkDataQuality",
        components: { ExplorerWrapper: networkDataQualitySummary },
      },
      {
        path: "data_strand_report",
        name: "dataStrandReport",
        components: { ExplorerWrapper: networkDatastrandReport },
      },
      {
        path: "population",
        name: "population",
        components: { ExplorerWrapper: networkPopulationReport },
      },
      {
        path: "overview",
        name: "overview",
        components: { ExplorerWrapper: networkOverview },
      },
      {
        path: "concept/:domain/:concept/summary",
        name: "concept",
        components: { ExplorerWrapper: networkConceptReport },
      },
    ],
  },

  {
    path: "/cdm/:cdm/:release",
    name: "cdm",
    components: { main: ExplorerWrapper },
    redirect: { name: "person" },
    children: [
      {
        path: "observation_period",
        name: "observationPeriod",
        components: { ExplorerWrapper: observationPeriodReport },
      },
      {
        path: "metadata",
        name: "metadata",
        components: { ExplorerWrapper: metadataReport },
      },
      {
        path: "death",
        name: "death",
        components: { ExplorerWrapper: deathReport },
      },
      {
        path: "data_quality",
        name: "dataQuality",
        components: { ExplorerWrapper: dataQualityResults },
      },
      {
        path: "data_density",
        name: "dataDensity",
        components: { ExplorerWrapper: domainDensity },
      },
      {
        path: "unmapped_source_codes",
        name: "unmappedSourceCodes",
        components: { ExplorerWrapper: unmappedSourceCodes },
      },
      {
        path: "performance",
        name: "performance",
        components: { ExplorerWrapper: performanceReport },
      },
      {
        path: "person",
        name: "person",
        components: { ExplorerWrapper: personReport },
      },
      {
        path: ":domain",
        components: { ExplorerWrapper: domainTable },
        name: "domainTable",
      },
      {
        path: ":domain/:concept/",
        components: { ExplorerWrapper: conceptReport },
      },
    ],
  },
  {
    path: "/datasource/:cdm",
    name: "datasource",
    components: { main: ExplorerWrapper },
    redirect: { name: "dataQualityHistory" },
    children: [
      {
        path: "data_quality_history",
        name: "dataQualityHistory",
        components: { ExplorerWrapper: dataQualityHistory },
      },
      {
        path: "domain_continuity",
        name: "domainContinuity",
        components: { ExplorerWrapper: domainContinuity },
      },
      {
        path: ":domain/:concept/overlay",
        name: "sourceConceptOverlay",
        components: { ExplorerWrapper: sourceConceptReport },
      },
    ],
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
