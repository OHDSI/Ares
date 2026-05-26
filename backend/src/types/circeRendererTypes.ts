export interface Option {
  id: string | number;
  name: string;
}

export interface ConceptItem {
  CONCEPT_NAME?: string;
  conceptName?: string;
}

export interface ConceptSetRef {
  IsExcluded?: boolean;
  isExcluded?: boolean;
  CodesetId?: string | number | null;
  codesetId?: string | number | null;
}

export interface WindowBound {
  Days?: number | null;
  days?: number | null;
  Coeff?: number;
  coeff?: number;
}

export interface CohortWindow {
  Start?: WindowBound;
  start?: WindowBound;
  End?: WindowBound;
  end?: WindowBound;
  UseEventEnd?: boolean;
  useEventEnd?: boolean;
  UseIndexEnd?: boolean;
  useIndexEnd?: boolean;
}

export interface DateRange {
  Op?: string;
  op?: string;
  Value?: string | number;
  value?: string | number;
  Extent?: string | number;
  extent?: string | number;
}

export interface NumericRange {
  Op?: string;
  op?: string;
  Value?: string | number;
  value?: string | number;
  Extent?: string | number;
  extent?: string | number;
}

export interface TextFilter {
  Op?: string;
  op?: string;
  Text?: string;
  text?: string;
}

export interface DateAdjustment {
  StartWith?: string;
  startWith?: string;
  EndWith?: string;
  endWith?: string;
  StartOffset?: number;
  startOffset?: number;
  EndOffset?: number;
  endOffset?: number;
}

export interface UserDefinedPeriod {
  StartDate?: string;
  startDate?: string;
  EndDate?: string;
  endDate?: string;
}

export interface Occurrence {
  Type?: number;
  type?: number;
  Count?: number;
  count?: number;
  IsDistinct?: boolean;
  isDistinct?: boolean;
  CountColumn?: string;
  countColumn?: string;
}

export interface CountCriteria {
  Occurrence?: Occurrence;
  occurrence?: Occurrence;
  Criteria?: Record<string, unknown>;
  criteria?: Record<string, unknown>;
  StartWindow?: CohortWindow;
  startWindow?: CohortWindow;
  EndWindow?: CohortWindow;
  endWindow?: CohortWindow;
  RestrictVisit?: boolean;
  restrictVisit?: boolean;
  IgnoreObservationPeriod?: boolean;
  ignoreObservationPeriod?: boolean;
}

export interface CriteriaGroup {
  CriteriaList?: CountCriteria[];
  criteriaList?: CountCriteria[];
  DemographicCriteriaList?: Record<string, unknown>[];
  demographicCriteriaList?: Record<string, unknown>[];
  Groups?: CriteriaGroup[];
  groups?: CriteriaGroup[];
  Type?: string;
  type?: string;
  Count?: number;
  count?: number;
}

export interface Limit {
  Type?: string;
  type?: string;
}

export interface ObservationWindow {
  PriorDays?: number;
  priorDays?: number;
  PostDays?: number;
  postDays?: number;
}

export interface PrimaryCriteria {
  CriteriaList?: Record<string, unknown>[];
  criteriaList?: Record<string, unknown>[];
  ObservationWindow?: ObservationWindow;
  observationWindow?: ObservationWindow;
  PrimaryCriteriaLimit?: Limit;
  primaryLimit?: Limit;
}

export interface ConceptSetItem {
  concept?: {
    CONCEPT_ID?: number;
    conceptId?: number;
    CONCEPT_NAME?: string;
    conceptName?: string;
    CONCEPT_CODE?: string;
    conceptCode?: string;
    VOCABULARY_ID?: string;
    vocabularyId?: string;
  };
  isExcluded?: boolean;
  includeDescendants?: boolean;
  includeMapped?: boolean;
}

export interface ConceptSet {
  id: string | number;
  name: string;
  expression?: { items?: ConceptSetItem[] };
}

export interface CollapseSettings {
  EraPad?: number;
  eraPad?: number;
}

export interface CensorWindow {
  StartDate?: string;
  startDate?: string;
  EndDate?: string;
  endDate?: string;
}

export interface InclusionRule {
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  expression?: CriteriaGroup;
  Expression?: CriteriaGroup;
}

export interface DateOffset {
  DateField?: string;
  dateField?: string;
  Offset?: number;
  offset?: number;
}

export interface CustomEra {
  DrugCodesetId?: string | number;
  drugCodesetId?: string | number;
  GapDays?: number;
  gapDays?: number;
  Offset?: number;
  offset?: number;
  DaysSupplyOverride?: number;
  daysSupplyOverride?: number;
}

export interface EndStrategy {
  DateOffset?: DateOffset;
  dateOffset?: DateOffset;
  CustomEra?: CustomEra;
  customEra?: CustomEra;
}

export interface CohortExpression {
  ConceptSets?: ConceptSet[];
  conceptSets?: ConceptSet[];
  PrimaryCriteria?: PrimaryCriteria;
  primaryCriteria?: PrimaryCriteria;
  AdditionalCriteria?: CriteriaGroup;
  additionalCriteria?: CriteriaGroup;
  QualifiedLimit?: Limit;
  qualifiedLimit?: Limit;
  ExpressionLimit?: Limit;
  expressionLimit?: Limit;
  InclusionRules?: InclusionRule[];
  inclusionRules?: InclusionRule[];
  EndStrategy?: EndStrategy;
  endStrategy?: EndStrategy;
  CensoringCriteria?: Record<string, unknown>[];
  censoringCriteria?: Record<string, unknown>[];
  CollapseSettings?: CollapseSettings;
  collapseSettings?: CollapseSettings;
  CensorWindow?: CensorWindow;
  censorWindow?: CensorWindow;
}

export const KNOWN_TYPES = [
  "ConditionEra",
  "ConditionOccurrence",
  "Death",
  "DeviceExposure",
  "DoseEra",
  "DrugEra",
  "DrugExposure",
  "LocationRegion",
  "Measurement",
  "Observation",
  "ObservationPeriod",
  "ProcedureOccurrence",
  "Specimen",
  "VisitOccurrence",
  "VisitDetail",
] as const;

export type KnownType = (typeof KNOWN_TYPES)[number];
export type CriteriaWrapper = Partial<
  Record<KnownType, Record<string, unknown>>
>;

export interface TypeMeta {
  label: string;
  default: string;
  source: string | null;
}
