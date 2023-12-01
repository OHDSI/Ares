import {
  ACHILLES_PERFORMANCE,
  CDM_SOURCE,
  CONCEPT,
  DEATH,
  DENSITY_DOMAIN_PERSON,
  DENSITY_RECORDS_PERSON,
  DENSITY_TOTAL,
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
  METADATA,
  NETWORK_PERFORMANCE,
  NETWORK_QUALITY_SUMMARY,
  NETWORK_UNMAPPED_SOURCE_CODES,
  OBSERVATION_PERIOD,
  PERSON,
  QUALITY_COMPLETENESS,
  QUALITY_INDEX,
  QUALITY_RESULTS,
  RECORDS_DOMAIN,
  SOURCE_CONCEPT,
  SOURCE_HISTORY_INDEX,
  TEMPORAL_CHARACTERIZATION,
} from "@/shared/config/files";
import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_RELEASE,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
} from "../model/store/actions.type";
import { FETCH_WEBAPI_INFO } from "@/shared/api/webAPI/data/store/actions.type";
import environment from "@/shared/api/environment";

export default function getFilesByView(params = null) {
  return {
    temporalCharacterization: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: TEMPORAL_CHARACTERIZATION, required: true }] },
    },
    feasibility: {
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
    webApi: {
      loadMethod: FETCH_WEBAPI_INFO,
      payload: {},
    },
    networkPerformance: {
      loadMethod: FETCH_FILES,
      payload: { files: [{ name: NETWORK_PERFORMANCE, required: true }] },
    },
    networkUnmappedSourceCodes: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: NETWORK_UNMAPPED_SOURCE_CODES, required: true }],
      },
    },
    networkConcept: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files:
          environment.DUCKDB_ENABLED === "true"
            ? params.files
            : [{ name: CONCEPT, instanceParams: [{}] }],
        duckdb_supported: true,
      },
    },
    networkDataQuality: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: NETWORK_QUALITY_SUMMARY, required: true }],
      },
    },
    dataStrandReport: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [{ name: RECORDS_DOMAIN, instanceParams: [{}] }],
      },
    },
    population: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [{ name: OBSERVATION_PERIOD, instanceParams: [{}] }],
      },
    },
    concept: {
      loadMethod: FETCH_FILES,
      payload: {
        files:
          environment.DUCKDB_ENABLED === "true"
            ? params.files
            : [
                { name: DOMAIN_SUMMARY, required: true },
                { name: CONCEPT, required: true },
              ],
        duckdb_supported: true,
      },
    },
    dataQuality: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: QUALITY_RESULTS, required: true }],
      },
    },
    death: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: DEATH, required: true }],
      },
    },
    dataDensity: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: DENSITY_TOTAL, required: true },
          { name: DENSITY_RECORDS_PERSON, required: true },
        ],
      },
    },
    domainTable: {
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

    metadata: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: METADATA, required: true },
          { name: CDM_SOURCE, required: true },
        ],
      },
    },
    observationPeriod: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: OBSERVATION_PERIOD, required: true }],
      },
    },
    performance: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: ACHILLES_PERFORMANCE, required: true }],
      },
    },
    person: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: PERSON, required: true }],
      },
    },
    unmappedSourceCodes: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: QUALITY_COMPLETENESS, required: true }],
      },
    },
    dataQualityHistory: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: QUALITY_INDEX, required: true }],
      },
    },
    domainContinuity: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [{ name: SOURCE_HISTORY_INDEX, required: true }],
      },
    },
    sourceConceptOverlay: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_RELEASE,
      payload: {
        files:
          environment.DUCKDB_ENABLED === "true"
            ? params.files
            : [{ name: SOURCE_CONCEPT }],
        duckdb_supported: true,
      },
    },
  };
}
