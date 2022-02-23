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
import networkUnmappedSourceCodes from "../interface/views/network/NetworkUnmappedSourceCodes.vue";
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
import DataSourcesExplorer from "../interface/views/DataSourcesExplorer";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    components: [App],
    redirect: "/home",
    meta: { showModules: true }
  },
  { path: "/home", components: { main: home } },
  { path: "/help", components: { main: help } },

  {
    path: "/network",
    name: "network",
    components: { main: DataSourcesExplorer },
    redirect: { name: "overview" },
    children: [
      {
        path: "network_data_quality",
        name: "networkDataQuality",
        components: { DataSourcesExplorer: networkDataQualitySummary }
      },
      {
        path: "network_unmapped_source_codes",
        name: "networkUnmappedSourceCodes",
        components: { DataSourcesExplorer: networkUnmappedSourceCodes }
      },
      {
        path: "data_strand_report",
        name: "dataStrandReport",
        components: { DataSourcesExplorer: networkDatastrandReport }
      },
      {
        path: "population",
        name: "population",
        components: { DataSourcesExplorer: networkPopulationReport }
      },
      {
        path: "overview",
        name: "overview",
        components: { DataSourcesExplorer: networkOverview }
      },
      {
        path: "concept/:domain/:concept/summary",
        name: "concept",
        components: { DataSourcesExplorer: networkConceptReport }
      }
    ]
  },

  {
    path: "/cdm/:cdm/:release",
    name: "cdm",
    components: { main: DataSourcesExplorer },
    redirect: { name: "person" },
    children: [
      {
        path: "observation_period",
        name: "observationPeriod",
        components: { DataSourcesExplorer: observationPeriodReport }
      },
      {
        path: "metadata",
        name: "metadata",
        components: { DataSourcesExplorer: metadataReport }
      },
      {
        path: "death",
        name: "death",
        components: { DataSourcesExplorer: deathReport }
      },
      {
        path: "data_quality",
        name: "dataQuality",
        components: { DataSourcesExplorer: dataQualityResults }
      },
      {
        path: "data_density",
        name: "dataDensity",
        components: { DataSourcesExplorer: domainDensity }
      },
      {
        path: "unmapped_source_codes",
        name: "unmappedSourceCodes",
        components: { DataSourcesExplorer: unmappedSourceCodes }
      },
      {
        path: "performance",
        name: "performance",
        components: { DataSourcesExplorer: performanceReport }
      },
      {
        path: "person",
        name: "person",
        components: { DataSourcesExplorer: personReport }
      },
      {
        path: ":domain",
        components: { DataSourcesExplorer: domainTable },
        name: "domainTable"
      },
      {
        path: ":domain/:concept/",
        components: { DataSourcesExplorer: conceptReport }
      }
    ]
  },
  {
    path: "/datasource/:cdm",
    name: "datasource",
    components: { main: DataSourcesExplorer },
    redirect: { name: "dataQualityHistory" },
    children: [
      {
        path: "data_quality_history",
        name: "dataQualityHistory",
        components: { DataSourcesExplorer: dataQualityHistory }
      },
      {
        path: "domain_continuity",
        name: "domainContinuity",
        components: { DataSourcesExplorer: domainContinuity }
      },
      {
        path: ":domain/:concept/overlay",
        name: "sourceConceptOverlay",
        components: { DataSourcesExplorer: sourceConceptReport }
      }
    ]
  },

  {
    path: "/publication/article",
    components: { main: article }
  }
];

export default new VueRouter({
  base: "/ares/",
  routes
});
