import home from "@/pages/info/Home.vue";
import help from "@/pages/info/Help";
import reportsView from "@/processes/exploreReports/ui/ReportsView";
import networkDataQualitySummary from "@/pages/reports/network/NetworkDataQualitySummary";
import networkPerformance from "@/pages/reports/network/NetworkPerformance";
import networkUnmappedSourceCodes from "@/pages/reports/network/NetworkUnmappedSourceCodes";
import NetworkDataFeasibilityReport from "@/pages/reports/network/NetworkDataFeasibilityReport";
import networkDatastrandReport from "@/pages/reports/network/NetworkDatastrandReport";
import networkPopulationReport from "@/pages/reports/network/NetworkPopulationReport";
import networkOverview from "@/pages/reports/network/NetworkOverview";
import networkConceptReport from "@/pages/reports/network/NetworkConceptReport";
import observationPeriodReport from "@/pages/reports/release/ObservationPeriodReport";
import TemporalCharacterization from "@/pages/reports/release/TemporalCharacterization";
import metadataReport from "@/pages/reports/release/MetadataReport";
import deathReport from "@/pages/reports/release/DeathReport";
import dataQualityResults from "@/pages/reports/release/DataQualityResults";
import domainDensity from "@/pages/reports/release/DomainDensity";
import unmappedSourceCodes from "@/pages/reports/release/UnmappedSourceCodes";
import performanceReport from "@/pages/reports/release/PerformanceTable";
import personReport from "@/pages/reports/release/PersonReport";
import domainTable from "@/pages/reports/release/DomainTable";
import conceptReport from "@/pages/reports/release/ConceptReport";
import dataQualityHistory from "@/pages/reports/source/DataQualityHistory";
import SourceOverview from "@/pages/reports/source/SourceOverview";
import domainContinuity from "@/pages/reports/source/DomainContinuity";
import sourceConceptReport from "@/pages/reports/source/SourceConceptReport";
import article from "@/pages/info/Article";

export default [
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
        components: { networkDataQualitySummary },
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
