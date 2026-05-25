import type {
  BinaryRiskFactorResult,
  ContinuousRiskFactorResult,
  CaseCountResult,
  CaseTargetCountResult,
  BinaryCaseSeriesResult,
  CharacterizationCohortBinaryResult,
  CharacterizationCohortContinuousResult,
  DeChallengeRechallengeResult,
  DeChallengeFailRow,
  TimeToEventResult,
  IncidenceRateResult,
  OutcomeAvailabilityResult,
} from "./characterization.js";

export type { SchemaVersion } from "#utils/schemaVersion.js";

export interface BaseOptions {
  schema: string;
  cgTablePrefix?: string;
  databaseTable?: string;
}

export interface CharacterizationBaseOptions extends BaseOptions {
  cTablePrefix?: string;
}

export interface IncidenceBaseOptions extends BaseOptions {
  ciTablePrefix?: string;
}

export type IdFilter = number | number[] | null;

export interface IdFilterOptions {
  targetIds?: IdFilter;
  outcomeIds?: IdFilter;
  databaseIds?: string[] | null;
}

export interface RiskWindowOptions {
  riskWindowStart?: IdFilter;
  riskWindowEnd?: IdFilter;
  startAnchor?: string | string[] | null;
  endAnchor?: string | string[] | null;
}

export interface CaseCountOptions
  extends CharacterizationBaseOptions, IdFilterOptions, RiskWindowOptions {}

export interface CaseTargetCountOptions
  extends CharacterizationBaseOptions, IdFilterOptions {}

export interface RiskFactorOptions
  extends CharacterizationBaseOptions, RiskWindowOptions {
  targetId: number;
  outcomeId: number;
  databaseIds?: string[] | null;
  analysisIds?: number[] | null;
}

export interface CaseSeriesOptions
  extends CharacterizationBaseOptions, RiskWindowOptions {
  targetId: number;
  outcomeId: number;
  databaseIds?: string[] | null;
  conceptIds?: number[] | null;
  minVal?: number | null;
}

export interface CharacterizationCohortOptions extends CharacterizationBaseOptions {
  targetIds?: number[] | null;
  databaseIds?: string[] | null;
  minThreshold?: number;
}

export interface OutcomeAvailabilityOptions extends CharacterizationBaseOptions {
  targetId: number;
  outcomeIds: number[];
  ciTablePrefix?: string;
}

export interface DechallengeOptions extends CharacterizationBaseOptions {
  targetIds?: number[] | null;
  outcomeIds?: number[] | null;
}

export interface DechallengeFailOptions extends CharacterizationBaseOptions {
  targetId: number;
  outcomeId: number;
  databaseId: string;
  dechallengeStopInterval?: number | null;
  dechallengeEvaluationWindow?: number | null;
}

export interface TimeToEventOptions extends CharacterizationBaseOptions {
  targetIds?: number[] | null;
  outcomeIds?: number[] | null;
}

export interface IncidenceOptions extends IncidenceBaseOptions {
  targetIds?: number[] | null;
  outcomeIds?: number[] | null;
}

export interface IncidenceTargetOptions extends IncidenceBaseOptions {
  ciTablePrefix?: string;
}

export interface IncidenceOutcomeOptions extends IncidenceBaseOptions {
  ciTablePrefix?: string;
  targetId?: number | null;
}

export interface TablePrefixOptions extends BaseOptions {
  cTablePrefix?: string;
  ciTablePrefix?: string;
  cmTablePrefix?: string;
  sccsTablePrefix?: string;
  plpTablePrefix?: string;
}

export interface TargetTableOptions extends TablePrefixOptions {
  getIncidenceInclusion?: boolean;
  getCharacterizationInclusion?: boolean;
  getPredictionInclusion?: boolean;
  getCohortMethodInclusion?: boolean;
  getSccsInclusion?: boolean;
}

export interface OutcomeTableOptions extends TablePrefixOptions {
  targetId?: number | null;
  getIncidenceInclusion?: boolean;
  getCharacterizationInclusion?: boolean;
  getPredictionInclusion?: boolean;
  getCohortMethodInclusion?: boolean;
  getSccsInclusion?: boolean;
}

export interface Adapter {
  getCaseCounts(options: CaseCountOptions): Promise<CaseCountResult[]>;
  getCaseTargetCounts(
    options: CaseTargetCountOptions,
  ): Promise<CaseTargetCountResult[]>;
  getBinaryRiskFactors(
    options: RiskFactorOptions,
  ): Promise<BinaryRiskFactorResult[] | null>;
  getContinuousRiskFactors(
    options: RiskFactorOptions,
  ): Promise<ContinuousRiskFactorResult[] | null>;
  getBinaryCaseSeries(
    options: CaseSeriesOptions,
  ): Promise<BinaryCaseSeriesResult[]>;
  getContinuousCaseSeries(
    options: CaseSeriesOptions,
  ): Promise<Record<string, unknown>[]>;
  getCharacterizationCohortBinary(
    options: CharacterizationCohortOptions,
  ): Promise<CharacterizationCohortBinaryResult>;
  getCharacterizationCohortContinuous(
    options: CharacterizationCohortOptions,
  ): Promise<CharacterizationCohortContinuousResult>;
  getOutcomeDataAvailability(
    options: OutcomeAvailabilityOptions,
  ): Promise<OutcomeAvailabilityResult[]>;
  getDechallengeRechallenge(
    options: DechallengeOptions,
  ): Promise<DeChallengeRechallengeResult[]>;
  getDechallengeRechallengeFails(
    options: DechallengeFailOptions,
  ): Promise<DeChallengeFailRow[]>;
  getTimeToEvent(options: TimeToEventOptions): Promise<TimeToEventResult[]>;
  getIncidenceRates(options: IncidenceOptions): Promise<IncidenceRateResult[]>;
  getIncidenceTargets(
    options: IncidenceTargetOptions,
  ): Promise<Record<string, unknown>[]>;
  getIncidenceOutcomes(
    options: IncidenceOutcomeOptions,
  ): Promise<Record<string, unknown>[]>;
  getCharacterizationTargets(
    options: TargetTableOptions,
  ): Promise<Record<string, unknown>[] | null>;
  getCharacterizationOutcomes(
    options: OutcomeTableOptions,
  ): Promise<Record<string, unknown>[] | null>;
  getCmTargets(options: TablePrefixOptions): Promise<Record<string, unknown>[]>;
  getCmOutcomes(
    options: OutcomeTableOptions,
  ): Promise<Record<string, unknown>[]>;
  getPredictionTargets(
    options: TablePrefixOptions,
  ): Promise<Record<string, unknown>[]>;
  getPredictionOutcomes(
    options: OutcomeTableOptions,
  ): Promise<Record<string, unknown>[]>;
  getSccsTargets(
    options: TablePrefixOptions,
  ): Promise<Record<string, unknown>[]>;
  getSccsOutcomes(
    options: OutcomeTableOptions,
  ): Promise<Record<string, unknown>[]>;
}
