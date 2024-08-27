import dataStrandReport from "@/processes/exploreReports/model/store/postprocessing/networkDataStrandReport";
import population from "@/processes/exploreReports/model/store/postprocessing/networkPopulationReport";
import networkConcept from "@/processes/exploreReports/model/store/postprocessing/networkConceptReport";
import death from "@/processes/exploreReports/model/store/postprocessing/deathReport";
import person from "@/processes/exploreReports/model/store/postprocessing/personReport";
import sourceConceptOverlay from "@/processes/exploreReports/model/store/postprocessing/sourceConceptReport";
import dataQuality from "@/processes/exploreReports/model/store/postprocessing/dataQualityResults";
import unmappedSourceCodes from "@/processes/exploreReports/model/store/postprocessing/unmappedSourceCodes";
import dataDensity from "@/processes/exploreReports/model/store/postprocessing/dataDensity";
import metadata from "@/processes/exploreReports/model/store/postprocessing/metadata";
import observationPeriod from "@/processes/exploreReports/model/store/postprocessing/observationPeriod";
import performance from "@/processes/exploreReports/model/store/postprocessing/performance";
import domainContinuity from "@/processes/exploreReports/model/store/postprocessing/domainContinuity";
import concept from "@/processes/exploreReports/model/store/postprocessing/conceptReport";
import domainTable from "@/processes/exploreReports/model/store/postprocessing/domainTable";
import feasibility from "@/processes/exploreReports/model/store/postprocessing/feasibility";
import networkUnmappedSourceCodes from "@/processes/exploreReports/model/store/postprocessing/networkUnmappedSourceCodes";
import networkDiversityReport from "@/processes/exploreReports/model/store/postprocessing/networkDiversityReport";
import cohortReport from "@/processes/exploreReports/model/store/postprocessing/cohortReport";
import networkConceptDashboard from "@/processes/exploreReports/model/store/postprocessing/networkConceptDashboard";
import dataSourceOverview from "@/processes/exploreReports/model/store/postprocessing/dataSourceOverview";

export default {
  dataStrandReport,
  population,
  networkConcept,
  death,
  person,
  sourceConceptOverlay,
  dataQuality,
  unmappedSourceCodes,
  dataDensity,
  metadata,
  observationPeriod,
  performance,
  domainContinuity,
  networkDiversityReport,
  concept,
  domainTable,
  feasibility,
  networkUnmappedSourceCodes,
  cohortReport,
  networkConceptDashboard,
  dataSourceOverview,
};
