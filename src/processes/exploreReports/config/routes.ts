import ReportsView from "@/processes/exploreReports/ui/ReportsView.vue";
import Home from "@/pages/info/Home.vue";
import Help from "@/pages/info/Help.vue";
import Article from "@/pages/info/Article.vue";
import NetworkDataQualitySummary from "@/pages/reports/network/NetworkDataQualitySummary/NetworkDataQualitySummary.vue";
import NetworkPerformance from "@/pages/reports/network/NetworkPerformance/NetworkPerformance.vue";
import NetworkUnmappedSourceCodes from "@/pages/reports/network/NetworkUnmappedSourceCodes/NetworkUnmappedSourceCodes.vue";
import NetworkDataFeasibilityReport from "@/pages/reports/network/NetworkDataFeasibilityReport/index.vue";
import NetworkDatastrandReport from "@/pages/reports/network/NetworkDatastrandReport/NetworkDatastrandReport.vue";
import NetworkPopulationReport from "@/pages/reports/network/NetworkPopulationReport/NetworkPopulationReport.vue";
import NetworkOverview from "@/pages/reports/network/NetworkOverview/NetworkOverview.vue";
import NetworkConceptReport from "@/pages/reports/network/NetworkConceptReport/NetworkConceptReport.vue";
import ObservationPeriodReport from "@/pages/reports/release/ObservationPeriodReport/ObservationPeriodReport.vue";
import TemporalCharacterization from "@/pages/reports/release/TemporalCharacterizationReport/TemporalCharacterization.vue";
import MetadataReport from "@/pages/reports/release/MetadataReport/MetadataReport.vue";
import DeathReport from "@/pages/reports/release/DeathReport/DeathReport.vue";
import DataQualityResults from "@/pages/reports/release/DataQualityResults/DataQualityResults.vue";
import DomainDensity from "@/pages/reports/release/DomainDensity/DomainDensity.vue";
import UnmappedSourceCodes from "@/pages/reports/release/UnmappedSourceCodesReport/UnmappedSourceCodes.vue";
import PerformanceReport from "@/pages/reports/release/PerformanceReport/PerformanceTable.vue";
import PersonReport from "@/pages/reports/release/PersonReport/PersonReport.vue";
import DomainTable from "@/pages/reports/release/DomainTable/DomainTable.vue";
import ConceptReport from "@/pages/reports/release/ConceptReport/ConceptReport.vue";
import DataQualityHistory from "@/pages/reports/source/DataQualityHistory/DataQualityHistory.vue";
import SourceOverview from "@/pages/reports/source/SourceOverview/SourceOverview.vue";
import DomainContinuity from "@/pages/reports/source/DomainContinuity/DomainContinuity.vue";
import SourceConceptReport from "@/pages/reports/source/SourceConceptReport/SourceConceptReport.vue";
import NetworkConceptDashboard from "@/pages/reports/network/NetworkConceptDashboard/NetworkConceptDashboard.vue";
import NetworkDiversityReport from "@/pages/reports/network/NetworkDiversityReport/NetworkDiversityReport.vue";
import CohortsTable from "@/pages/reports/release/CohortsTable/CohortsTable.vue";
import CohortDrilldownReport from "@/pages/reports/release/CohortDrilldownReport/CohortDrilldownReport.vue";
import LocationReport from "@/pages/reports/release/Location/LocationReport.vue";

import WebApiInfo from "@/pages/info/WebApiInfo.vue";

import { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    components: { main: ReportsView },
    redirect: { name: "home" },
    meta: { showModules: true },
    children: [
      { path: "/home", name: "home", components: { reportsView: Home } },
      { path: "/help", name: "help", components: { reportsView: Help } },
      {
        path: "/publication/article",
        name: "article",
        components: { reportsView: Article },
      },
    ],
  },

  {
    path: "/network",
    name: "network",
    components: { main: ReportsView },
    redirect: { name: "overview" },
    children: [
      {
        path: "network_data_quality",
        name: "networkDataQuality",
        components: { reportsView: NetworkDataQualitySummary },
      },

      {
        path: "network_concept/:domain?/:concept?",
        name: "networkConcept",
        components: { reportsView: NetworkConceptReport },
      },
      {
        path: "network_concept_dashboard",
        name: "networkConceptDashboard",
        components: { reportsView: NetworkConceptDashboard },
      },
      {
        path: "web_api",
        name: "webApi",
        components: { reportsView: WebApiInfo },
      },
      {
        path: "network_performance",
        name: "networkPerformance",
        components: { reportsView: NetworkPerformance },
      },
      {
        path: "network_diversity",
        name: "networkDiversityReport",
        components: { reportsView: NetworkDiversityReport },
      },
      {
        path: "network_unmapped_source_codes",
        name: "networkUnmappedSourceCodes",
        components: { reportsView: NetworkUnmappedSourceCodes },
      },
      {
        path: "feasibility",
        name: "feasibility",
        components: { reportsView: NetworkDataFeasibilityReport },
      },
      {
        path: "data_strand_report",
        name: "dataStrandReport",
        components: { reportsView: NetworkDatastrandReport },
      },
      {
        path: "population",
        name: "population",
        components: { reportsView: NetworkPopulationReport },
      },
      {
        path: "overview",
        name: "overview",
        components: { reportsView: NetworkOverview },
      },
      /*{
        path: "concept/:domain/:concept/summary",
        name: "networkConcept",
        components: { reportsView: networkConceptReport },
      },*/
    ],
  },
  {
    path: "/cdm/:cdm",
    name: "datasource",
    components: { main: ReportsView },
    redirect: { name: "dataSourceOverview" },
    children: [
      {
        path: "data_quality_history",
        name: "dataQualityHistory",
        components: { reportsView: DataQualityHistory },
      },
      {
        path: "data_source_overview",
        name: "dataSourceOverview",
        components: { reportsView: SourceOverview },
      },
      {
        path: "domain_continuity",
        name: "domainContinuity",
        components: { reportsView: DomainContinuity },
      },
      {
        path: ":domain/:concept/overlay",
        name: "sourceConceptOverlay",
        components: { reportsView: SourceConceptReport },
      },
    ],
  },

  {
    path: "/cdm/:cdm/:release",
    name: "cdm",
    components: { main: ReportsView },
    redirect: { name: "person" },
    children: [
      {
        path: "observation_period",
        name: "observationPeriod",
        components: { reportsView: ObservationPeriodReport },
      },
      {
        path: "location",
        name: "location",
        components: { reportsView: LocationReport },
      },
      {
        path: "temporal_characterization",
        name: "temporalCharacterization",
        components: { reportsView: TemporalCharacterization },
      },
      {
        path: "metadata",
        name: "metadata",
        components: { reportsView: MetadataReport },
      },
      {
        path: "death",
        name: "death",
        components: { reportsView: DeathReport },
      },
      {
        path: "data_quality",
        name: "dataQuality",
        components: { reportsView: DataQualityResults },
      },
      {
        path: "data_density",
        name: "dataDensity",
        components: { reportsView: DomainDensity },
      },
      {
        path: "unmapped_source_codes",
        name: "unmappedSourceCodes",
        components: { reportsView: UnmappedSourceCodes },
      },
      {
        path: "performance",
        name: "performance",
        components: { reportsView: PerformanceReport },
      },
      {
        path: "person",
        name: "person",
        components: { reportsView: PersonReport },
      },
      {
        path: "cohorts",
        name: "cohorts",
        components: { reportsView: CohortsTable },
      },
      {
        path: "cohorts/:cohort_id/",
        name: "cohortReport",
        components: { reportsView: CohortDrilldownReport },
      },
      {
        path: ":domain",
        components: { reportsView: DomainTable },
        name: "domainTable",
      },
      {
        path: ":domain/:concept/",
        components: { reportsView: ConceptReport },
        name: "concept",
      },
    ],
  },
];
