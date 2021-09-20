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
  { path: "/_network/overview", components: { main: networkOverview } },
  {
    path: "/_network/concept/:domain/:concept/summary",
    components: { main: networkConceptReport },
  },
  {
    path: "/_network/dataquality",
    components: { main: networkDataQualitySummary },
  },
  {
    path: "/_network/datastrand",
    components: { main: networkDatastrandReport },
  },
  {
    path: "/_network/population",
    components: { main: networkPopulationReport   },
  },
  {
    path: "/_cdm/:cdm/:release/domain/:domain/summary",
    components: { main: domainTable },
  },
  {
    path: "/_cdm/:cdm/:release/observationperiod",
    components: { main: observationPeriodReport },
  },
  {
    path: "/_cdm/:cdm/:release/metadata",
    components: { main: metadataReport },
  },
  {
    path: "/_cdm/:cdm/:release/death",
    components: { main: deathReport },
  },
  {
    path: "/_cdm/:cdm/:release/quality/",
    components: { main: dataQualityResults },
  },
  { path: "/_cdm/:cdm/:release/density/", components: { main: domainDensity } },
  {
    path: "/_cdm/:cdm/:release/unmapped/",
    components: { main: unmappedSourceCodes },
  },
  {
    path: "/_cdm/:cdm/:release/performance/",
    components: { main: performanceReport },
  },
  {
    path: "/_cdm/:cdm/:release/person/",
    components: { main: personReport },
  },
  {
    path: "/_datasource/:cdm/quality-history",
    components: { main: dataQualityHistory },
  },
  {
    path: "/_datasource/:cdm/concept/:domain/:concept/overlay",
    components: {main: sourceConceptReport}
  },
  {
    path: "/_datasource/:cdm/domain-continuity",
    components: { main: domainContinuity },
  },
  {
    path: "/_cdm/:cdm/:release/concept/:domain/:concept/summary",
    components: { main: conceptReport },
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
