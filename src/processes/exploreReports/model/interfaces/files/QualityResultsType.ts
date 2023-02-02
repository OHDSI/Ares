export interface QualityResultsType {
  CheckResults: CheckResults[];
  Metadata: Metadata;
  endTimestamp: string[];
  executionTime: string[];
  startTimestamp: string;
  Overview: Overview;
}

export interface CheckResults {
  CATEGORY: string;
  CDM_FIELD_NAME: string;
  CDM_TABLE_NAME: string;
  CHECK_DESCRIPTION: string;
  CHECK_LEVEL: string;
  CHECK_NAME: string;
  CONTEXT: string;
  EXECUTION_TIME: string;
  FAILED: string;
  NOTES_EXIST: string;
  NUM_DENOMINATOR_ROWS: number;
  NUM_VIOLATED_ROWS: number;
  PCT_VIOLATED_ROWS: number;
  QUERY_TEXT: string;
  SQL_FILE: string;
  SUBCATEGORY: string;
  THRESHOLD_VALUE: number;
  _row: string;
  checkId: string;
}

export interface Overview {
  countErrorFailed: number[];
  countFailedCompleteness: number[];
  countFailedConformance: number[];
  countFailedPlausibility: number[];
  countOverallFailed: number[];
  countPassed: number[];
  countPassedCompleteness: number[];
  countPassedConformance: number[];
  countPassedPlausibility: number[];
  countThresholdFailed: number[];
  countTotal: number[];
  countTotalCompleteness: number[];
  countTotalConformance: number[];
  countTotalPlausibility: number[];
  percentFailed: number[];
  percentPassed: number[];
}

export interface Metadata {
  CDM_ETL_REFERENCE: string;
  CDM_HOLDER: string;
  CDM_RELEASE_DATE: string;
  CDM_SOURCE_ABBREVIATION: string;
  CDM_SOURCE_NAME: string;
  CDM_VERSION: string;
  CDM_VERSION_CONCEPT_ID: number;
  DQD_VERSION: string;
  SOURCE_DESCRIPTION: string;
  SOURCE_DOCUMENTATION_REFERENCE: string;
  SOURCE_RELEASE_DATE: string;
  VOCABULARY_VERSION: string;
}
