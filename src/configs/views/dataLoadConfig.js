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
  HELP,
  METADATA,
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
} from "@/data/services/getFilePath";
import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_RELEASE,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
} from "@/data/store/modules/view/actions.type";

export default function getFilesByView() {
  return {
    feasibility: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [
          OBSERVATION_PERIOD,
          PERSON,
          DENSITY_DOMAIN_PERSON,
          DOMAIN_SUMMARY,
        ],
        params: { domain: "visit_occurrence" },
      },
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
        files: [CONCEPT],
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
        files: [RECORDS_DOMAIN],
      },
    },
    population: {
      loadMethod: FETCH_MULTIPLE_FILES_BY_SOURCE,
      payload: {
        files: [OBSERVATION_PERIOD],
      },
    },
    concept: {
      loadMethod: FETCH_FILES,
      payload: {
        files: [
          { name: DOMAIN_SUMMARY, required: true },
          { name: CONCEPT, required: true },
        ],
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
        files: [SOURCE_CONCEPT],
      },
    },
  };
}
