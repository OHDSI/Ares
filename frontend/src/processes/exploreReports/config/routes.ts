import ReportsView from "@/processes/exploreReports/ui/ReportsView.vue";
import Home from "@/pages/info/home";
import NetworkDataQualitySummary from "@/pages/reports/network/NetworkDataQualitySummary";
import NetworkPerformance from "@/pages/reports/network/NetworkPerformance";
import NetworkUnmappedSourceCodes from "@/pages/reports/network/NetworkUnmappedSourceCodes";
import NetworkDataFeasibilityReport from "@/pages/reports/network/NetworkDataFeasibilityReport";
import NetworkDatastrandReport from "@/pages/reports/network/NetworkDatastrandReport";
import NetworkPopulationReport from "@/pages/reports/network/NetworkPopulationReport";
import NetworkOverview from "@/pages/reports/network/NetworkOverview";
import ObservationPeriodReport from "@/pages/reports/release/ObservationPeriodReport";
import TemporalCharacterization from "@/pages/reports/release/TemporalCharacterizationReport";
import MetadataReport from "@/pages/reports/release/MetadataReport";
import DeathReport from "@/pages/reports/release/DeathReport";
import DataQualityResults from "@/pages/reports/release/DataQualityResults";
import DomainDensity from "@/pages/reports/release/DomainDensity";
import UnmappedSourceCodes from "@/pages/reports/release/UnmappedSourceCodesReport";
import PerformanceReport from "@/pages/reports/release/PerformanceReport";
import PersonReport from "@/pages/reports/release/PersonReport";
import DomainTable from "@/pages/reports/release/DomainTable";
import DataQualityHistory from "@/pages/reports/source/DataQualityHistory";
import SourceOverview from "@/pages/reports/source/SourceOverview";
import DomainContinuity from "@/pages/reports/source/DomainContinuity";
import SourceConceptReport from "@/pages/reports/source/SourceConceptReport";
import NetworkDiversityReport from "@/pages/reports/network/NetworkDiversityReport";
import CohortsTable from "@/pages/reports/release/CohortsTable";
import LocationReport from "@/pages/reports/release/Location";
import NetworkAnnotationsReport from "@/pages/reports/network/networkAnnotationsReport";
import CostTable from "@/pages/reports/release/CostTable";
import WebApiInfo from "@/pages/info/webApiInfo";
import Strategus from "@/pages/strategus/strategus";

import { RouteRecordRaw } from "vue-router";
import NetworkComparisonTool from "@/pages/reports/network/NetworkComparisonTool";
import NetworkCostReport from "@/pages/reports/network/networkCostReport";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    components: { main: ReportsView },
    redirect: { name: "home" },
    meta: { showModules: true },
    children: [
      { path: "/home", name: "home", components: { reportsView: Home } },
    ],
  },

  {
    path: "/characterization",
    components: { main: ReportsView },
    redirect: { name: "characterization" },
    meta: { showModules: true },
    children: [
      {
        path: "characterization",
        name: "characterization",
        components: { reportsView: Strategus },
      },
      // { path: "/home", name: "home", components: { reportsView: Home } },
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
        path: "network_cost_report",
        name: "networkCostReport",
        components: { reportsView: NetworkCostReport },
      },
      {
        path: "network_annotations_report",
        name: "networkAnnotationsReport",
        components: { reportsView: NetworkAnnotationsReport },
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
        path: "network_comparison_tool/:report?/:cdm?/:release?/:domain?/:concept?",
        name: "networkComparisonTool",
        components: { reportsView: NetworkComparisonTool },
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
        path: "cost_table",
        name: "costTable",
        components: { reportsView: CostTable },
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
        path: "cohorts/:cohort_id?/",
        name: "cohorts",
        components: { reportsView: CohortsTable },
      },
      {
        path: ":domain/:concept?/",
        components: { reportsView: DomainTable },
        name: "domainTable",
      },
    ],
  },
];
