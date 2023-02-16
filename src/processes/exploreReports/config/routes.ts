import reportsView from "@/processes/exploreReports/ui/ReportsView.vue";
import home from "@/pages/info/Home.vue";
import help from "@/pages/info/Help.vue";
import article from "@/pages/info/Article.vue";
import networkDataQualitySummary from "@/pages/reports/network/NetworkDataQualitySummary.vue";
import networkPerformance from "@/pages/reports/network/NetworkPerformance.vue";
import networkUnmappedSourceCodes from "@/pages/reports/network/NetworkUnmappedSourceCodes.vue";
import NetworkDataFeasibilityReport from "@/pages/reports/network/NetworkDataFeasibilityReport/index.vue";
import networkDatastrandReport from "@/pages/reports/network/NetworkDatastrandReport.vue";
import networkPopulationReport from "@/pages/reports/network/NetworkPopulationReport.vue";
import networkOverview from "@/pages/reports/network/NetworkOverview.vue";
import networkConceptReport from "@/pages/reports/network/NetworkConceptReport.vue";
import observationPeriodReport from "@/pages/reports/release/ObservationPeriodReport.vue";
import TemporalCharacterization from "@/pages/reports/release/TemporalCharacterization.vue";
import metadataReport from "@/pages/reports/release/MetadataReport.vue";
import deathReport from "@/pages/reports/release/DeathReport.vue";
import dataQualityResults from "@/pages/reports/release/DataQualityResults.vue";
import domainDensity from "@/pages/reports/release/DomainDensity.vue";
import unmappedSourceCodes from "@/pages/reports/release/UnmappedSourceCodes.vue";
import performanceReport from "@/pages/reports/release/PerformanceTable.vue";
import personReport from "@/pages/reports/release/PersonReport.vue";
import domainTable from "@/pages/reports/release/DomainTable.vue";
import conceptReport from "@/pages/reports/release/ConceptReport.vue";
import dataQualityHistory from "@/pages/reports/source/DataQualityHistory.vue";
import SourceOverview from "@/pages/reports/source/SourceOverview.vue";
import domainContinuity from "@/pages/reports/source/DomainContinuity.vue";
import sourceConceptReport from "@/pages/reports/source/SourceConceptReport.vue";
import WebApiInfo from "@/pages/info/WebApiInfo.vue";
import networkConceptDashboard from "@/pages/reports/network/NetworkConceptDashboard/NetworkConceptDashboard.vue";

import { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    components: { main: reportsView },
    redirect: { name: "home" },
    meta: { showModules: true },
    children: [
      { path: "/home", name: "home", components: { reportsView: home } },
      { path: "/help", name: "help", components: { reportsView: help } },
      {
        path: "/publication/article",
        name: "article",
        components: { reportsView: article },
      },
    ],
  },

  {
    path: "/network",
    name: "network",
    components: { main: reportsView },
    redirect: { name: "overview" },
    children: [
      {
        path: "network_data_quality",
        name: "networkDataQuality",
        components: { reportsView: networkDataQualitySummary },
      },
      {
        path: "network_concept_dashboard",
        name: "networkConceptDashboard",
        components: { reportsView: networkConceptDashboard },
      },
      {
        path: "web_api",
        name: "webApi",
        components: { reportsView: WebApiInfo },
      },
      {
        path: "network_performance",
        name: "networkPerformance",
        components: { reportsView: networkPerformance },
      },
      {
        path: "network_unmapped_source_codes",
        name: "networkUnmappedSourceCodes",
        components: { reportsView: networkUnmappedSourceCodes },
      },
      {
        path: "feasibility",
        name: "feasibility",
        components: { reportsView: NetworkDataFeasibilityReport },
      },
      {
        path: "data_strand_report",
        name: "dataStrandReport",
        components: { reportsView: networkDatastrandReport },
      },
      {
        path: "population",
        name: "population",
        components: { reportsView: networkPopulationReport },
      },
      {
        path: "overview",
        name: "overview",
        components: { reportsView: networkOverview },
      },
      {
        path: "concept/:domain/:concept/summary",
        name: "networkConcept",
        components: { reportsView: networkConceptReport },
      },
    ],
  },

  {
    path: "/cdm/:cdm/:release",
    name: "cdm",
    components: { main: reportsView },
    redirect: { name: "person" },
    children: [
      {
        path: "observation_period",
        name: "observationPeriod",
        components: { reportsView: observationPeriodReport },
      },
      {
        path: "temporal_characterization",
        name: "temporalCharacterization",
        components: { reportsView: TemporalCharacterization },
      },
      {
        path: "metadata",
        name: "metadata",
        components: { reportsView: metadataReport },
      },
      {
        path: "death",
        name: "death",
        components: { reportsView: deathReport },
      },
      {
        path: "data_quality",
        name: "dataQuality",
        components: { reportsView: dataQualityResults },
      },
      {
        path: "data_density",
        name: "dataDensity",
        components: { reportsView: domainDensity },
      },
      {
        path: "unmapped_source_codes",
        name: "unmappedSourceCodes",
        components: { reportsView: unmappedSourceCodes },
      },
      {
        path: "performance",
        name: "performance",
        components: { reportsView: performanceReport },
      },
      {
        path: "person",
        name: "person",
        components: { reportsView: personReport },
      },
      {
        path: ":domain",
        components: { reportsView: domainTable },
        name: "domainTable",
      },
      {
        path: ":domain/:concept/",
        components: { reportsView: conceptReport },
        name: "concept",
      },
    ],
  },
  {
    path: "/datasource/:cdm",
    name: "datasource",
    components: { main: reportsView },
    redirect: { name: "dataSourceOverview" },
    children: [
      {
        path: "data_quality_history",
        name: "dataQualityHistory",
        components: { reportsView: dataQualityHistory },
      },
      {
        path: "data_source_overview",
        name: "dataSourceOverview",
        components: { reportsView: SourceOverview },
      },
      {
        path: "domain_continuity",
        name: "domainContinuity",
        components: { reportsView: domainContinuity },
      },
      {
        path: ":domain/:concept/overlay",
        name: "sourceConceptOverlay",
        components: { reportsView: sourceConceptReport },
      },
    ],
  },
];
