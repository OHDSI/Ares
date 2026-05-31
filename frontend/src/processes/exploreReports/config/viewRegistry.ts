import {
  mdiAlphaMCircleOutline,
  mdiChartLine,
  mdiChartTimeline,
  mdiCompareHorizontal,
  mdiCurrencyUsd,
  mdiDatabaseSearch,
  mdiDna,
  mdiEyeCircleOutline,
  mdiHeartFlash,
  mdiHeartOffOutline,
  mdiHistory,
  mdiHospitalBuilding,
  mdiMapMarkerOutline,
  mdiNeedle,
  mdiNoteTextOutline,
  mdiPill,
  mdiShape,
  mdiSigmaLower,
  mdiSpeedometer,
  mdiTable,
  mdiAccountGroupOutline,
  mdiTextBoxMultipleOutline,
  mdiAccountOutline,
  mdiTestTube,
  mdiTransitConnectionVariant,
  mdiVirusOutline,
} from "@mdi/js";

import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_RELEASE,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
} from "../model/store/actions.type";
import { FETCH_WEBAPI_INFO } from "@/shared/api/webAPI/data/store/actions.type";
import {
  ACHILLES_PERFORMANCE,
  CDM_SOURCE,
  COHORT_CHARACTERIZATION,
  COHORT_DIAGNOSTICS_PERFORMANCE,
  COHORT_INDEX,
  COHORT_INDEX_EVENT_BREAKDOWN,
  COHORT_TEMPORAL_COVARIATE_DISTRIBUTION,
  CONCEPT,
  COST_CONCEPT,
  COST_DOMAIN_SUMMARY,
  COST_TIMESERIES,
  DEATH,
  DENSITY_DOMAIN_PERSON,
  DENSITY_RECORDS_PERSON,
  DENSITY_TOTAL,
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
  LOCATION,
  METADATA,
  NETWORK_COST_INDEX,
  NETWORK_PERFORMANCE,
  NETWORK_QUALITY_SUMMARY,
  NETWORK_UNMAPPED_SOURCE_CODES,
  OBSERVATION_PERIOD,
  PERSON,
  QUALITY_COMPLETENESS,
  QUALITY_DELTA,
  QUALITY_INDEX,
  QUALITY_RESULTS,
  RECORDS_DOMAIN,
  SOURCE_CONCEPT,
  SOURCE_HISTORY_INDEX,
  TEMPORAL_CHARACTERIZATION,
} from "@/shared/config/files";
import environment from "@/shared/api/environment";

import dataStrandReport from "../model/store/postprocessing/networkDataStrandReport";
import population from "../model/store/postprocessing/networkPopulationReport";
import networkComparisonTool from "../model/store/postprocessing/networkComparisonTool";
import death from "../model/store/postprocessing/deathReport";
import person from "../model/store/postprocessing/personReport";
import sourceConceptOverlay from "../model/store/postprocessing/sourceConceptReport";
import dataQuality from "../model/store/postprocessing/dataQualityResults";
import unmappedSourceCodes from "../model/store/postprocessing/unmappedSourceCodes";
import dataDensity from "../model/store/postprocessing/dataDensity";
import metadata from "../model/store/postprocessing/metadata";
import observationPeriod from "../model/store/postprocessing/observationPeriod";
import performance from "../model/store/postprocessing/performance";
import domainContinuity from "../model/store/postprocessing/domainContinuity";
import networkDiversityReport from "../model/store/postprocessing/networkDiversityReport";
import concept from "../model/store/postprocessing/conceptReport";
import domainTable from "../model/store/postprocessing/domainTable";
import feasibility from "../model/store/postprocessing/feasibility";
import networkUnmappedSourceCodes from "../model/store/postprocessing/networkUnmappedSourceCodes";
import cohorts from "../model/store/postprocessing/cohorts";
import networkConceptDashboard from "../model/store/postprocessing/networkConceptDashboard";
import dataSourceOverview from "../model/store/postprocessing/dataSourceOverview";
import costTable from "../model/store/postprocessing/costTable";
import costDrilldown from "../model/store/postprocessing/costDrilldown";

type LoadConfig = { loadMethod: string; payload: any };
type ExplorerFolder = "Data Network" | "Data Source" | "Data Source Release";

interface ExplorerEntry {
  folder: ExplorerFolder;
  icon: string;
  label: string;
  webApiRequired?: boolean;
  childName?: string;
  domainChildren?: Array<{ icon: string; label: string; domain: string }>;
}

export interface ViewDescriptor {
  name: string;
  loadConfig?: LoadConfig | ((params: { files?: any[] }) => LoadConfig);
  postprocessor?: (data: any) => any;
  charts?: string[];
  errorMessage?: string;
  explorer?: ExplorerEntry;
}

export const viewRegistry: ViewDescriptor[] = [
  {
    name: "dataQuality",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: QUALITY_RESULTS, required: true }] },
    },
    postprocessor: dataQuality,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiSigmaLower,
      label: "Data Quality",
    },
  },
  {
    name: "person",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: PERSON, required: true }] },
    },
    postprocessor: person,
    charts: [
      "viz-populationAgeSexPerson",
      "viz-race",
      "viz-birthyearnote",
      "viz-ethnicity",
    ],
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiAccountOutline,
      label: "Person",
    },
  },
  {
    name: "domainTable",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: DOMAIN_SUMMARY, required: true },
          { name: DOMAIN_ISSUES, required: true },
          { name: DOMAIN_DRUG_STRATIFICATION, required: false },
          { name: DOMAIN_VISIT_STRATIFICATION, required: false },
          { name: METADATA, required: false },
        ],
      },
    },
    postprocessor: domainTable,
    charts: ["viz-recordproportionbymonth"],
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiTable,
      label: "Domains",
      childName: "concept",
      domainChildren: [
        {
          icon: mdiVirusOutline,
          label: "Conditions",
          domain: "condition_occurrence",
        },
        {
          icon: mdiVirusOutline,
          label: "Condition Eras",
          domain: "condition_era",
        },
        { icon: mdiPill, label: "Drugs", domain: "drug_exposure" },
        { icon: mdiPill, label: "Drug Eras", domain: "drug_era" },
        {
          icon: mdiHospitalBuilding,
          label: "Visit Occurrence",
          domain: "visit_occurrence",
        },
        {
          icon: mdiHospitalBuilding,
          label: "Visit Detail",
          domain: "visit_detail",
        },
        { icon: mdiTestTube, label: "Measurements", domain: "measurement" },
        {
          icon: mdiEyeCircleOutline,
          label: "Observations",
          domain: "observation",
        },
        {
          icon: mdiNeedle,
          label: "Procedures",
          domain: "procedure_occurrence",
        },
        {
          icon: mdiHeartFlash,
          label: "Device Exposures",
          domain: "device_exposure",
        },
      ],
    },
  },
  {
    name: "cohorts",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: COHORT_INDEX, required: true }],
        duckdb_supported: true,
      },
    },
    postprocessor: cohorts,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiAccountGroupOutline,
      label: "Cohorts",
    },
  },
  {
    name: "dataDensity",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: DENSITY_TOTAL, required: true },
          { name: DENSITY_RECORDS_PERSON, required: true },
        ],
      },
    },
    postprocessor: dataDensity,
    charts: ["viz-densityOverview", "viz-recordsperperson"],
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiChartLine,
      label: "Data Density",
    },
  },
  {
    name: "observationPeriod",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: OBSERVATION_PERIOD, required: true }] },
    },
    postprocessor: observationPeriod,
    charts: [
      "viz-ageatfirstobservation",
      "viz-agebysex",
      "viz-cumulativeobservation",
      "viz-observationbymonth",
      "viz-observationbyage",
      "viz-observationbysex",
    ],
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiEyeCircleOutline,
      label: "Observation Period",
    },
  },
  {
    name: "costTable",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: COST_DOMAIN_SUMMARY, required: true },
          { name: COST_TIMESERIES, required: true },
        ],
      },
    },
    postprocessor: costTable,
    charts: ["viz-costtime"],
    errorMessage: "Cost information not available for this data source",
    explorer: {
      folder: "Data Source Release",
      icon: mdiCurrencyUsd,
      label: "Cost Table",
    },
  },
  {
    name: "costDrilldown",
    loadConfig: (params) => ({
      loadMethod: FETCH_FILES,
      payload: {
        files: environment.DUCKDB_ENABLED
          ? params.files
          : [
              { name: COST_CONCEPT, required: true },
              { name: COST_DOMAIN_SUMMARY, required: true },
            ],
        duckdb_supported: true,
      },
    }),
    postprocessor: costDrilldown,
    errorMessage: "Cost information not available for this data source.",
  },
  {
    name: "location",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: LOCATION, required: true }] },
    },
    errorMessage:
      "Location data is not available. Please run the latest version of achilles then try again",
    explorer: {
      folder: "Data Source Release",
      icon: mdiMapMarkerOutline,
      label: "Location",
    },
  },

  // Network

  {
    name: "networkComparisonTool",
    postprocessor: networkComparisonTool,
    explorer: {
      folder: "Data Network",
      icon: mdiCompareHorizontal,
      label: "Network Comparison Tool",
    },
  },
  {
    name: "networkAnnotationsReport",
    explorer: {
      folder: "Data Network",
      icon: mdiNoteTextOutline,
      label: "Network Annotations Report",
    },
  },
  {
    name: "feasibility",
    loadConfig: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [
          {
            name: OBSERVATION_PERIOD,
            instanceParams: [{ domain: "visit_occurrence" }],
          },
          { name: PERSON, instanceParams: [{ domain: "visit_occurrence" }] },
          {
            name: DENSITY_DOMAIN_PERSON,
            instanceParams: [{ domain: "visit_occurrence" }],
          },
          {
            name: DOMAIN_SUMMARY,
            instanceParams: [{ domain: "visit_occurrence" }],
          },
        ],
      },
    },

    postprocessor: feasibility,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Network",
      icon: mdiDatabaseSearch,
      label: "Data Source Feasibility",
    },
  },
  {
    name: "webApi",
    loadConfig: {
      loadMethod: FETCH_WEBAPI_INFO,
      payload: {},
    },
    explorer: {
      folder: "Data Network",
      icon: mdiDatabaseSearch,
      label: "Web API",
      webApiRequired: true,
    },
  },
  {
    name: "networkPerformance",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: NETWORK_PERFORMANCE, required: true }] },
    },
    errorMessage:
      "Network performance file is not found. Please make sure it exists within the data directory then try again",
    explorer: {
      folder: "Data Network",
      icon: mdiSpeedometer,
      label: "Network Performance",
    },
  },

  // Source

  {
    name: "dataQualityHistory",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: QUALITY_INDEX, required: true },
          { name: QUALITY_DELTA, required: false },
        ],
      },
    },
    charts: [
      "viz-dataqualityresults",
      "viz-sourcedataqualityresultsbycategory",
      "viz-sourcedataqualityresultsbydomain",
    ],
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source",
      icon: mdiHistory,
      label: "Data Quality History",
    },
  },
  {
    name: "dataSourceOverview",
    loadConfig: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_RELEASE,
      payload: {
        files: [{ name: RECORDS_DOMAIN }],
      },
    },
    postprocessor: dataSourceOverview,
    charts: ["issues_releases", "population_releases"],
    errorMessage: "Records-by-domain.csv file not found",
    explorer: {
      folder: "Data Source",
      icon: mdiTable,
      label: "Data Source Overview",
    },
  },
  {
    name: "domainContinuity",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: SOURCE_HISTORY_INDEX, required: true }] },
    },
    postprocessor: domainContinuity,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source",
      icon: mdiChartTimeline,
      label: "Domain Continuity",
    },
  },
  {
    name: "sourceConceptOverlay",
    loadConfig: (params) => ({
      loadMethod: FETCH_MULTIPLE_FILES_BY_RELEASE,
      payload: {
        files: environment.DUCKDB_ENABLED
          ? params.files
          : [{ name: SOURCE_CONCEPT }],
        duckdb_supported: true,
      },
    }),
    postprocessor: sourceConceptOverlay,
    charts: ["viz-sourcerecordproportionbymonth"],
    errorMessage: "Requested files not found",
  },

  // Release (continued)

  {
    name: "death",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: DEATH, required: true }] },
    },
    postprocessor: death,
    charts: [
      "viz-ageatdeath",
      "viz-deathbytype",
      "viz-recordproportionbyagesexyear",
      "viz-deathrecordproportionbymonth",
    ],
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiHeartOffOutline,
      label: "Death",
    },
  },
  {
    name: "unmappedSourceCodes",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: QUALITY_COMPLETENESS, required: true }] },
    },
    postprocessor: unmappedSourceCodes,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiTransitConnectionVariant,
      label: "Unmapped Source Codes",
    },
  },
  {
    name: "metadata",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: METADATA, required: true },
          { name: CDM_SOURCE, required: true },
        ],
      },
    },
    postprocessor: metadata,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiAlphaMCircleOutline,
      label: "Metadata",
    },
  },
  {
    name: "temporalCharacterization",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: TEMPORAL_CHARACTERIZATION, required: true }] },
    },
    errorMessage:
      "Temporal characterization file is not found. Please make sure it exists within the current release folder then try again",
    explorer: {
      folder: "Data Source Release",
      icon: mdiTextBoxMultipleOutline,
      label: "Temporal Characterization",
    },
  },
  {
    name: "performance",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: ACHILLES_PERFORMANCE, required: true },
          { name: COHORT_DIAGNOSTICS_PERFORMANCE, required: false },
        ],
      },
    },
    postprocessor: performance,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Source Release",
      icon: mdiSpeedometer,
      label: "Performance",
    },
  },

  // Network (continued)

  {
    name: "overview",
    explorer: {
      folder: "Data Network",
      icon: mdiTable,
      label: "Overview",
    },
  },
  {
    name: "networkDataQuality",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: NETWORK_QUALITY_SUMMARY, required: true }] },
    },
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Network",
      icon: mdiSigmaLower,
      label: "Quality Assessment",
    },
  },
  {
    name: "networkCostReport",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: NETWORK_COST_INDEX, required: true }] },
    },
    errorMessage:
      "Network Cost Index is not available. Please run AresIndexer and try again",
    explorer: {
      folder: "Data Network",
      icon: mdiCurrencyUsd,
      label: "Network Cost Report",
    },
  },
  {
    name: "population",
    loadConfig: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [{ name: OBSERVATION_PERIOD, instanceParams: [{}] }],
      },
    },
    postprocessor: population,
    errorMessage: "No files found across all data sources",
    explorer: {
      folder: "Data Network",
      icon: mdiChartLine,
      label: "Population Overview",
    },
  },
  {
    name: "networkDiversityReport",
    loadConfig: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [{ name: PERSON, instanceParams: [{}] }],
      },
    },
    postprocessor: networkDiversityReport,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Network",
      icon: mdiShape,
      label: "Network Diversity Report",
    },
  },
  {
    name: "dataStrandReport",
    loadConfig: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [{ name: RECORDS_DOMAIN, instanceParams: [{}] }],
      },
    },
    postprocessor: dataStrandReport,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Network",
      icon: mdiDna,
      label: "Data Strand Report",
    },
  },
  {
    name: "networkUnmappedSourceCodes",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: NETWORK_UNMAPPED_SOURCE_CODES, required: true }],
      },
    },
    postprocessor: networkUnmappedSourceCodes,
    errorMessage: "Requested files not found",
    explorer: {
      folder: "Data Network",
      icon: mdiTable,
      label: "Unmapped Source Codes",
    },
  },

  // not used
  {
    name: "networkConcept",
    loadConfig: (params) => ({
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: environment.DUCKDB_ENABLED
          ? params.files
          : [{ name: CONCEPT, instanceParams: [{}] }],
        duckdb_supported: true,
      },
    }),
    errorMessage: "Requested files not found",
  },
  {
    name: "networkConceptDashboard",
    postprocessor: networkConceptDashboard,
  },
  {
    // Not used
    name: "cohortReport",
    loadConfig: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: COHORT_CHARACTERIZATION, required: true },
          { name: COHORT_INDEX_EVENT_BREAKDOWN, required: true },
          { name: COHORT_TEMPORAL_COVARIATE_DISTRIBUTION, required: true },
        ],
        duckdb_supported: true,
      },
    },
    charts: ["viz-beforeIndex", "viz-afterIndex", "viz-between"],
    errorMessage: "Requested files not found",
  },
  {
    // not used
    name: "concept",
    loadConfig: (params) => ({
      loadMethod: FETCH_FILES,
      payload: {
        files: environment.DUCKDB_ENABLED
          ? params.files
          : [
              { name: DOMAIN_SUMMARY, required: true },
              { name: CONCEPT, required: true },
            ],
        duckdb_supported: true,
      },
    }),
    postprocessor: concept,
    errorMessage:
      "Seems like the data file for that particular concept is missing.",
  },
];

// Derived registries

export function getFilesByView(params: { files?: any[] } = { files: [] }) {
  return Object.fromEntries(
    viewRegistry
      .filter((v) => v.loadConfig)
      .map((v) => [
        v.name,
        typeof v.loadConfig === "function"
          ? v.loadConfig(params)
          : v.loadConfig,
      ]),
  );
}

export const postprocessingRegistry: Record<string, (data: any) => any> =
  Object.fromEntries(
    viewRegistry
      .filter((v) => v.postprocessor)
      .map((v) => [v.name, v.postprocessor]),
  );

export const pageChartsRegistry: Record<string, string[]> = Object.fromEntries(
  viewRegistry.filter((v) => v.charts?.length).map((v) => [v.name, v.charts]),
);

export function getViewErrorMessage(routeName: string): string | undefined {
  return viewRegistry.find((v) => v.name === routeName)?.errorMessage;
}

export function getExplorerReports() {
  const result: any[] = [];
  for (const v of viewRegistry) {
    if (!v.explorer) continue;
    const { folder, icon, label, webApiRequired, childName, domainChildren } =
      v.explorer;
    const item: any = { folder, icon, name: label, routeName: v.name };
    if (webApiRequired) item.webApiRequired = true;
    if (childName) {
      item.childName = childName;
      item.domain = true;
    }
    if (domainChildren) {
      item.reports = domainChildren.map((d) => ({
        folder,
        icon: d.icon,
        name: d.label,
        routeName: v.name,
        domain: d.domain,
      }));
    }
    result.push(item);
  }
  return result;
}
