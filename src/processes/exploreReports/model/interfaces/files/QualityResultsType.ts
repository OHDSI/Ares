export interface QualityResultsType {
  CheckResults: CheckResults[];
  Metadata: Metadata;
  endTimestamp: string[];
  executionTime: string[];
  startTimestamp: string;
  Overview: Overview;
}

export interface CheckResults {
  category: string;
  cdmFieldName: string;
  cdmTableName: string;
  checkDescription: string;
  checkLevel: string;
  checkName: string;
  context: string;
  executionTime: string;
  failed: string;
  notesExist: string;
  numDenominatorRows: number;
  numViolatedRows: number;
  pctViolatedRows: number;
  queryText: string;
  sqlFile: string;
  subcategory: string;
  thresholdValue: number;
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
  cdmEtlReference: string;
  cdmHolder: string;
  cdmReleaseDate: string;
  cdmSourceAbbreviation: string;
  cdmSourceName: string;
  cdmVersion: string;
  cdmVersionConceptId: number;
  dqdVersion: string;
  sourceDescription: string;
  sourceDocumentationReference: string;
  sourceReleaseDate: string;
  vocabularyVersion: string;
}
