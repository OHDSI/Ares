export interface ParsedCovariateName {
  domain: string | null;
  concept: string | null;
  timeWindow: "temporal" | "any_time_prior" | "window";
  windowDays: string | null;
  subType: string | null;
  detail: string | null;
}

/** Analysis inclusion flags: 1 = included, 0 = not included */
type AnalysisFlag = 0 | 1;

export interface TargetTableRow {
  cohortId: number;
  cohortName: string;
  parentName: string | null;
  subsetParent: number | null;
  subsetDefinitionId: number | null;
  numDatabase: number;
  databaseString: string;
  databaseIdString: string;
  databaseStringCount: string;
  minSubjectCount: number;
  maxSubjectCount: number;
  minEntryCount: number;
  maxEntryCount: number;
  timeToEvent: AnalysisFlag;
  dechalRechal: AnalysisFlag;
  riskFactors: AnalysisFlag;
  databaseComparator: AnalysisFlag;
  cohortComparator: AnalysisFlag;
  caseSeries: AnalysisFlag;
  cohortMethod: AnalysisFlag;
  selfControlledCaseSeries: AnalysisFlag;
  prediction: AnalysisFlag;
  cohortIncidence: AnalysisFlag;
}

export interface OutcomeTableRow {
  cohortId: number;
  cohortName: string;
  parentName: string | null;
  subsetParent: number | null;
  subsetDefinitionId: number | null;
  numDatabase: number;
  databaseString: string;
  databaseIdString: string;
  databaseStringCount: string;
  minSubjectCount: number;
  maxSubjectCount: number;
  minEntryCount: number;
  maxEntryCount: number;
  timeToEvent: AnalysisFlag;
  dechalRechal: AnalysisFlag;
  riskFactors: AnalysisFlag;
  caseSeries: AnalysisFlag;
  cohortMethod: AnalysisFlag;
  selfControlledCaseSeries: AnalysisFlag;
  prediction: AnalysisFlag;
  cohortIncidence: AnalysisFlag;
}

export interface CovariateRef {
  id: number;
  cohortId: number;
  cohortName: string;
  databaseId: string;
  databaseName: string;
  n: number;
  minPriorObservation: number;
}

/** Binary covariate row, pivoted by cohort column id (sumValue_N, averageValue_N) */
export interface BinaryCovariate {
  covariateName: string;
  covariateNameParsed: ParsedCovariateName;
  covariateId: number;
  SMD?: number;
  absSMD?: number;
  [key: string]: unknown;
}

/** Continuous covariate row, pivoted by cohort column id (countValue_N, averageValue_N, etc.) */
export interface ContinuousCovariate {
  covariateName: string;
  covariateNameParsed: ParsedCovariateName;
  covariateId: number;
  minPriorObservation: number;
  SMD?: number;
  absSMD?: number;
  [key: string]: unknown;
}

export interface CharacterizationCohortBinaryResult {
  covariates: BinaryCovariate[];
  covRef: CovariateRef[];
}

export interface CharacterizationCohortContinuousResult {
  covariates: ContinuousCovariate[];
  covRef: CovariateRef[];
}

export interface BinaryRiskFactorResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetCohortId: number;
  outcomeName: string;
  outcomeCohortId: number;
  minPriorObservation: number;
  outcomeWashoutDays: number;
  riskWindowStart: number;
  riskWindowEnd: number;
  startAnchor: string;
  endAnchor: string;
  covariateName: string;
  covariateNameParsed: ParsedCovariateName;
  covariateId: number;
  casePersonCount: number;
  nonCasePersonCount: number;
  caseCount: number;
  caseAverage: number;
  nonCaseCount: number;
  nonCaseAverage: number;
  SMD: number;
  absSMD: number;
}

export interface ContinuousRiskFactorResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetCohortId: number;
  minPriorObservation: number;
  covariateName: string;
  covariateNameParsed: ParsedCovariateName;
  covariateId: number;
  outcomeCohortId: number;
  outcomeName: string;
  outcomeWashoutDays: number;
  riskWindowStart: number;
  riskWindowEnd: number;
  startAnchor: string;
  endAnchor: string;
  targetCountValue: number;
  targetMinValue: number;
  targetMaxValue: number;
  targetAverageValue: number;
  targetStandardDeviation: number;
  targetMedianValue: number;
  targetP10Value: number;
  targetP25Value: number;
  targetP75Value: number;
  targetP90Value: number;
  caseCountValue: number;
  caseMinValue: number;
  caseMaxValue: number;
  caseAverageValue: number;
  caseStandardDeviation: number;
  caseMedianValue: number;
  caseP10Value: number;
  caseP25Value: number;
  caseP75Value: number;
  caseP90Value: number;
  SMD: number;
  absSMD: number;
}

export interface CaseCountResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetId: number;
  outcomeName: string;
  outcomeId: number;
  rowCount: number;
  personCount: number;
  minPriorObservation: number;
  outcomeWashoutDays: number;
  riskWindowStart: number;
  riskWindowEnd: number;
  startAnchor: string;
  endAnchor: string;
}

export interface CaseTargetCountResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetId: number;
  outcomeName: string;
  outcomeId: number;
  rowCount: number;
  personCount: number;
  withoutExcludedPersonCount: number;
  minPriorObservation: number;
  outcomeWashoutDays: number;
}

export interface BinaryCaseSeriesResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetCohortId: number;
  outcomeName: string;
  outcomeCohortId: number;
  type: "Before" | "During" | "After";
  covariateName: string;
  covariateNameParsed: ParsedCovariateName;
  covariateId: number;
  minPriorObservation: number;
  outcomeWashoutDays: number;
  casePostOutcomeDuration: number;
  casePreTargetDuration: number;
  riskWindowStart: number;
  startAnchor: string;
  riskWindowEnd: number;
  endAnchor: string;
  sumValue: number;
  averageValue: number;
}

export interface IncidenceRateResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetId: number;
  outcomeName: string;
  outcomeId: number;
  cleanWindow: number;
  subgroupName: string;
  ageGroupName: string;
  genderName: string;
  startYear: number;
  tarStartWith: string;
  tarStartOffset: number;
  tarEndWith: string;
  tarEndOffset: number;
  personsAtRiskPe: number;
  personsAtRisk: number;
  personDaysPe: number;
  personDays: number;
  personOutcomesPe: number;
  personOutcomes: number;
  outcomesPe: number;
  outcomes: number;
  incidenceProportionP100p: number;
  incidenceRateP100py: number;
}

export interface TimeToEventResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetId: number;
  outcomeName: string;
  outcomeId: number;
  outcomeType: string;
  targetOutcomeType: string;
  timeToEvent: number;
  numEvents: number;
  timeScale: string;
}

export interface DeChallengeRechallengeResult {
  databaseName: string;
  databaseId: string;
  targetName: string;
  targetId: number;
  outcomeName: string;
  outcomeId: number;
  dechallengeStopInterval: number;
  dechallengeEvaluationWindow: number;
  numExposureEras: number;
  numPersonsExposed: number;
  numCases: number;
  dechallengeAttempt: number;
  dechallengeFail: number;
  dechallengeSuccess: number;
  rechallengeAttempt: number;
  rechallengeFail: number;
  rechallengeSuccess: number;
  pctDechallengeAttempt: number;
  pctDechallengeFail: number;
  pctDechallengeSuccess: number;
  pctRechallengeAttempt: number;
  pctRechallengeFail: number;
  pctRechallengeSuccess: number;
}

export interface DeChallengeFailRow {
  databaseId: string;
  databaseName: string;
  targetId: number;
  outcomeId: number;
  subjectId: number;
  dechallengeStopInterval: number;
  dechallengeEvaluationWindow: number;
  [key: string]: unknown;
}

export interface OutcomeAvailabilityResult {
  targetId: number;
  outcomeId: number;
  [key: string]: unknown;
}
