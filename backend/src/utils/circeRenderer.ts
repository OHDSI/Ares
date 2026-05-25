// Port of circe-be FreeMarker templates (cohortExpression.ftl + criteriaTypes.ftl + inputTypes.ftl + utils.ftl)
// Renders a CIRCE cohort expression JSON to markdown.

// Local domain types

interface Option {
  id: string | number;
  name: string;
}

interface ConceptItem {
  CONCEPT_NAME?: string;
  conceptName?: string;
}

interface ConceptSetRef {
  IsExcluded?: boolean;
  isExcluded?: boolean;
  CodesetId?: string | number | null;
  codesetId?: string | number | null;
}

interface WindowBound {
  Days?: number | null;
  days?: number | null;
  Coeff?: number;
  coeff?: number;
}

interface CohortWindow {
  Start?: WindowBound;
  start?: WindowBound;
  End?: WindowBound;
  end?: WindowBound;
  UseEventEnd?: boolean;
  useEventEnd?: boolean;
  UseIndexEnd?: boolean;
  useIndexEnd?: boolean;
}

interface DateRange {
  Op?: string;
  op?: string;
  Value?: string | number;
  value?: string | number;
  Extent?: string | number;
  extent?: string | number;
}

interface NumericRange {
  Op?: string;
  op?: string;
  Value?: string | number;
  value?: string | number;
  Extent?: string | number;
  extent?: string | number;
}

interface TextFilter {
  Op?: string;
  op?: string;
  Text?: string;
  text?: string;
}

interface DateAdjustment {
  StartWith?: string;
  startWith?: string;
  EndWith?: string;
  endWith?: string;
  StartOffset?: number;
  startOffset?: number;
  EndOffset?: number;
  endOffset?: number;
}

interface UserDefinedPeriod {
  StartDate?: string;
  startDate?: string;
  EndDate?: string;
  endDate?: string;
}

interface Occurrence {
  Type?: number;
  type?: number;
  Count?: number;
  count?: number;
  IsDistinct?: boolean;
  isDistinct?: boolean;
  CountColumn?: string;
  countColumn?: string;
}

interface CountCriteria {
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

interface CriteriaGroup {
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

interface Limit {
  Type?: string;
  type?: string;
}

interface ObservationWindow {
  PriorDays?: number;
  priorDays?: number;
  PostDays?: number;
  postDays?: number;
}

interface PrimaryCriteria {
  CriteriaList?: Record<string, unknown>[];
  criteriaList?: Record<string, unknown>[];
  ObservationWindow?: ObservationWindow;
  observationWindow?: ObservationWindow;
  PrimaryCriteriaLimit?: Limit;
  primaryLimit?: Limit;
}

interface ConceptSetItem {
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

interface ConceptSet {
  id: string | number;
  name: string;
  expression?: { items?: ConceptSetItem[] };
}

interface CollapseSettings {
  EraPad?: number;
  eraPad?: number;
}

interface CensorWindow {
  StartDate?: string;
  startDate?: string;
  EndDate?: string;
  endDate?: string;
}

interface InclusionRule {
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  expression?: CriteriaGroup;
  Expression?: CriteriaGroup;
}

interface DateOffset {
  DateField?: string;
  dateField?: string;
  Offset?: number;
  offset?: number;
}

interface CustomEra {
  DrugCodesetId?: string | number;
  drugCodesetId?: string | number;
  GapDays?: number;
  gapDays?: number;
  Offset?: number;
  offset?: number;
  DaysSupplyOverride?: number;
  daysSupplyOverride?: number;
}

interface EndStrategy {
  DateOffset?: DateOffset;
  dateOffset?: DateOffset;
  CustomEra?: CustomEra;
  customEra?: CustomEra;
}

interface CohortExpression {
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

type KnownType = (typeof KNOWN_TYPES)[number];
type CriteriaWrapper = Partial<Record<KnownType, Record<string, unknown>>>;

// Utils

function toSafeArray<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : [];
}

function optionName(options: Option[], id: string | number): string {
  const match = options.find((o) => String(o.id) === String(id));
  return match ? match.name : String(id ?? "");
}

function codesetName(
  id: string | number | null | undefined,
  defaultName: string,
  conceptSets: ConceptSet[],
): string {
  if (id === null || id === undefined || id === "") return defaultName;
  const cs = (conceptSets ?? []).find((s) => String(s.id) === String(id));
  return cs ? `'${cs.name}'` : defaultName;
}

function formatDate(s: string | number | null | undefined): string {
  if (!s) return "_empty_";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) {
    const [y = 0, m = 0, d = 0] = String(s).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return String(s);
}

function renderCheckbox(v: unknown): string {
  return v ? "YES" : "NO";
}

function formatValue(value: number, unit = ""): string {
  if (!unit) return String(value);
  return `${value} ${unit}${value !== 1 ? "s" : ""}`;
}

// Input types

const DATE_RANGE_OPS: Record<string, string> = {
  lt: "before",
  lte: "on or before",
  eq: "on",
  gt: "after",
  gte: "on or after",
  bt: "between",
  "!bt": "not between",
};

function renderDateRange(range: DateRange | null | undefined): string {
  if (!range) return "";
  const op = range.Op ?? range.op ?? "";
  const opName = DATE_RANGE_OPS[op] ?? op;
  const val = formatDate(range.Value ?? range.value);
  if (op.endsWith("bt")) {
    return `${opName} ${val} and ${formatDate(range.Extent ?? range.extent)}`;
  }
  return `${opName} ${val}`;
}

const NUMERIC_RANGE_OPS: Record<string, string> = {
  lt: "<",
  lte: "<=",
  eq: "=",
  gt: ">",
  gte: ">=",
  bt: "between",
  "!bt": "not between",
};

function renderNumericRange(range: NumericRange | null | undefined): string {
  if (!range) return "";
  const op = range.Op ?? range.op ?? "";
  const opName = NUMERIC_RANGE_OPS[op] ?? op;
  const val = range.Value ?? range.value ?? "";
  if (op.endsWith("bt")) {
    return `${opName} ${val} and ${range.Extent ?? range.extent ?? ""}`;
  }
  return `${opName} ${val}`;
}

const TEXT_FILTER_OPS: Record<string, string> = {
  startsWith: "starting with",
  contains: "containing",
  endsWith: "ending with",
  "!startsWith": "not starting with",
  "!contains": "not containing",
  "!endsWith": "not ending with",
};

function renderTextFilter(filter: TextFilter | null | undefined): string {
  if (!filter) return "";
  const op = filter.Op ?? filter.op ?? "";
  const text = filter.Text ?? filter.text ?? "";
  return `${TEXT_FILTER_OPS[op] ?? op} "${text}"`;
}

function renderConceptList(
  list: ConceptItem[] | null | undefined,
  quote = '"',
): string {
  if (!list || !Array.isArray(list) || list.length === 0)
    return "[none specified]";
  const names = list.map(
    (item) =>
      `${quote}${(item.CONCEPT_NAME ?? item.conceptName ?? "").toLowerCase()}${quote}`,
  );
  if (names.length === 1) return names[0] ?? "";
  const last = names[names.length - 1] ?? "";
  return names.slice(0, -1).join(", ") + " or " + last;
}

function renderConceptSetSelection(
  sel: ConceptSetRef | null | undefined,
  conceptSets: ConceptSet[],
  defaultName = "any",
): string {
  if (!sel) return "";
  const excluded = (sel.IsExcluded ?? sel.isExcluded) ? "not " : "";
  const id = sel.CodesetId ?? sel.codesetId;
  return `${excluded}in ${codesetName(id, defaultName, conceptSets)}`;
}

const RESULT_LIMIT_OPTIONS: Option[] = [
  { id: "All", name: "all events" },
  { id: "First", name: "earliest event" },
  { id: "Last", name: "latest event" },
];

function renderLimit(limit: Limit | null | undefined): string {
  if (!limit) return "all events";
  return optionName(RESULT_LIMIT_OPTIONS, limit.Type ?? limit.type ?? "All");
}

const DATE_OFFSET_FIELD_OPTIONS: Option[] = [
  { id: "StartDate", name: "start date" },
  { id: "EndDate", name: "end date" },
];

function renderDateAdjustment(da: DateAdjustment | null | undefined): string {
  if (!da || Object.keys(da).length === 0) return "";
  const startWith = da.StartWith ?? da.startWith ?? "START_DATE";
  const endWith = da.EndWith ?? da.endWith ?? "END_DATE";
  const startOffset = da.StartOffset ?? da.startOffset ?? 0;
  const endOffset = da.EndOffset ?? da.endOffset ?? 0;
  const toDatePart = (dt: string) =>
    dt === "START_DATE" ? "start date" : "end date";
  const startDesc =
    startOffset !== 0
      ? `${Math.abs(startOffset)} days ${startOffset < 0 ? "before" : "after"}`
      : "on";
  const endDesc =
    endOffset !== 0
      ? `${Math.abs(endOffset)} days ${endOffset < 0 ? "before" : "after"}`
      : "on";
  const startWithPart =
    startWith !== endWith ? ` the event ${toDatePart(startWith)}` : "";
  return `starting ${startDesc}${startWithPart} and ending ${endDesc} the event ${toDatePart(endWith)}`;
}

function renderUserDefinedPeriod(
  p: UserDefinedPeriod | null | undefined,
): string {
  if (!p) return "";
  const start = p.StartDate ?? p.startDate;
  const end = p.EndDate ?? p.endDate;
  if (!start && !end) return "";
  let desc = "";
  if (start) desc += `a user defined start date of ${formatDate(start)}`;
  if (start && end) desc += " and";
  if (end)
    desc += `${!start ? "a user defined " : " "}end date of ${formatDate(end)}`;
  return desc;
}

function renderWindow(
  w: CohortWindow | null | undefined,
  indexLabel = "cohort entry",
): string {
  if (!w) return "";
  const start = w.Start ?? w.start ?? {};
  const end = w.End ?? w.end ?? {};
  const useEventEnd = w.UseEventEnd ?? w.useEventEnd ?? false;
  const useIndexEnd = w.UseIndexEnd ?? w.useIndexEnd ?? false;
  const eventPart = useEventEnd ? "ending" : "starting";
  const indexPart = useIndexEnd ? "end date" : "start date";
  const dir = (coeff: number) => (coeff < 0 ? "before" : "after");
  const startDays = start.Days ?? start.days;
  const endDays = end.Days ?? end.days;
  const startCoeff = start.Coeff ?? start.coeff ?? -1;
  const endCoeff = end.Coeff ?? end.coeff ?? 1;

  if (
    startDays === null ||
    (startDays === undefined && endDays === 0 && startCoeff === -1)
  ) {
    return `${eventPart} anytime on or before ${indexLabel} ${indexPart}`;
  }
  if (endDays === 1 && startCoeff === -1 && endCoeff === -1) {
    const prior =
      startDays !== null && startDays !== undefined
        ? `in the ${startDays} days`
        : "anytime";
    return `${eventPart} ${prior} prior to ${indexLabel} ${indexPart}`;
  }
  if (
    startDays === null ||
    (startDays === undefined && (endDays ?? 0) > 1 && startCoeff === -1)
  ) {
    return `${eventPart} anytime up to ${endDays} days ${dir(endCoeff)} ${indexLabel} ${indexPart}`;
  }
  if (
    endDays === null ||
    (endDays === undefined && (startDays ?? 0) > 0 && endCoeff === 1)
  ) {
    return `${eventPart} ${startDays} days ${dir(startCoeff)} ${indexLabel} ${indexPart}`;
  }
  const s = startDays ?? "all";
  const e = endDays ?? "all";
  return `${eventPart} between ${s} days ${dir(startCoeff)} and ${e} days ${dir(endCoeff)} ${indexLabel} ${indexPart}`;
}

// Criteria types helpers

function renderAgeGender(c: Record<string, unknown>): string {
  const ageAtStart = c["Age"] ?? c["AgeAtStart"] ?? c["age"] ?? c["ageAtStart"];
  const ageAtEnd = c["AgeAtEnd"] ?? c["ageAtEnd"];
  const gender = c["Gender"] ?? c["gender"];
  const genderCS = c["GenderCS"] ?? c["genderCS"];

  const parts: string[] = [];

  if ((gender as ConceptItem[] | undefined)?.length || ageAtStart || ageAtEnd) {
    let desc = "who are";
    const genderList = gender as ConceptItem[] | undefined;
    if (genderList?.length) {
      desc += ` ${renderConceptList(genderList, "")}`;
      if ((ageAtStart || ageAtEnd) && genderList.length > 1) desc += ",";
    }
    if (ageAtStart) {
      desc += ` ${renderNumericRange(ageAtStart as NumericRange)} years old`;
      if (ageAtEnd) desc += " at era start and";
    }
    if (ageAtEnd) {
      desc += ` ${renderNumericRange(ageAtEnd as NumericRange)} years old at era end`;
    }
    if (genderCS) desc += ";";
    parts.push(desc);
  }
  if (genderCS) {
    parts.push(
      `who have gender ${renderConceptSetSelection(genderCS as ConceptSetRef, [])} concept set`,
    );
  }
  return parts.join(" ");
}

function renderEventDateCriteria(
  startRange: DateRange | null | undefined,
  endRange: DateRange | null | undefined,
): string {
  if (!startRange && !endRange) return "";
  if (startRange && endRange)
    return `starting ${renderDateRange(startRange)} and ending ${renderDateRange(endRange)}`;
  if (startRange) return `starting ${renderDateRange(startRange)}`;
  return `ending ${renderDateRange(endRange)}`;
}

function renderWindowCriteria(
  countCriteria: CountCriteria,
  indexLabel = "cohort entry",
): string {
  const sw = countCriteria.StartWindow ?? countCriteria.startWindow;
  const ew = countCriteria.EndWindow ?? countCriteria.endWindow;
  const windowParts: string[] = [];

  if (sw) {
    const s = sw.Start ?? sw.start ?? {};
    const e = sw.End ?? sw.end ?? {};
    const sDays = s.Days ?? s.days;
    const eDays = e.Days ?? e.days;
    if (
      (sDays !== null && sDays !== undefined) ||
      (eDays !== null && eDays !== undefined)
    )
      windowParts.push(renderWindow(sw, indexLabel));
  }
  if (ew) {
    const s = ew.Start ?? ew.start ?? {};
    const e = ew.End ?? ew.end ?? {};
    const sDays = s.Days ?? s.days;
    const eDays = e.Days ?? e.days;
    if (
      (sDays !== null && sDays !== undefined) ||
      (eDays !== null && eDays !== undefined)
    )
      windowParts.push(renderWindow(ew, indexLabel));
  }

  const restrictParts: string[] = [];
  if (countCriteria.RestrictVisit ?? countCriteria.restrictVisit)
    restrictParts.push(`at same visit as ${indexLabel}`);
  if (
    countCriteria.IgnoreObservationPeriod ??
    countCriteria.ignoreObservationPeriod
  )
    restrictParts.push("allow events outside observation period");

  if (!windowParts.length && !restrictParts.length) return "";
  return (
    windowParts.join(" and ") +
    (restrictParts.length
      ? (windowParts.length ? "; " : "") + restrictParts.join(" and ")
      : "")
  );
}

const KNOWN_TYPES = [
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

function criteriaTypeName(wrapper: CriteriaWrapper): KnownType | null {
  for (const t of KNOWN_TYPES) if (wrapper[t]) return t;
  return null;
}

interface TypeMeta {
  label: string;
  default: string;
  source: string | null;
}

const TYPE_META: Record<KnownType, TypeMeta> = {
  ConditionEra: {
    label: "condition era",
    default: "any condition",
    source: null,
  },
  ConditionOccurrence: {
    label: "condition occurrence",
    default: "any condition",
    source: "ConditionSourceConcept",
  },
  Death: { label: "death", default: "any form", source: "DeathSourceConcept" },
  DeviceExposure: {
    label: "device exposure",
    default: "any device",
    source: "DeviceSourceConcept",
  },
  DoseEra: { label: "dose era", default: "any drug", source: null },
  DrugEra: { label: "drug era", default: "any drug", source: null },
  DrugExposure: {
    label: "drug exposure",
    default: "any drug",
    source: "DrugSourceConcept",
  },
  LocationRegion: { label: "location", default: "any location", source: null },
  Measurement: {
    label: "measurement",
    default: "any measurement",
    source: "MeasurementSourceConcept",
  },
  Observation: {
    label: "observation",
    default: "any observation",
    source: "ObservationSourceConcept",
  },
  ObservationPeriod: {
    label: "observation period",
    default: "observation period",
    source: null,
  },
  ProcedureOccurrence: {
    label: "procedure occurrence",
    default: "any procedure",
    source: "ProcedureSourceConcept",
  },
  Specimen: {
    label: "specimen",
    default: "any specimen",
    source: "SpecimenSourceConcept",
  },
  VisitOccurrence: {
    label: "visit occurrence",
    default: "any visit",
    source: "VisitSourceConcept",
  },
  VisitDetail: {
    label: "visit detail",
    default: "any visit detail",
    source: "VisitDetailSourceConcept",
  },
};

function buildTypeAttrs(
  type: KnownType,
  c: Record<string, unknown>,
  conceptSets: ConceptSet[],
): string[] {
  const attrs: string[] = [];
  const push = (v: string) => {
    if (v) attrs.push(v);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const A = (key: string): any =>
    c[key] ?? c[key.charAt(0).toLowerCase() + key.slice(1)];

  switch (type) {
    case "ConditionEra":
      push(renderEventDateCriteria(A("EraStartDate"), A("EraEndDate")));
      if (A("EraLength"))
        push(`era length is ${renderNumericRange(A("EraLength"))} days`);
      if (A("OccurrenceCount"))
        push(
          `containing ${renderNumericRange(A("OccurrenceCount"))} occurrences`,
        );
      break;

    case "ConditionOccurrence":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("ConditionType")?.length)
        push(
          `a condition type that${A("ConditionTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("ConditionType"))}`,
        );
      if (A("ConditionTypeCS"))
        push(
          `a condition type concept ${renderConceptSetSelection(A("ConditionTypeCS"), conceptSets)} concept set`,
        );
      if (A("StopReason"))
        push(`with a stop reason ${renderTextFilter(A("StopReason"))}`);
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider specialty concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("ConditionStatus")?.length)
        push(
          `a condition status that is: ${renderConceptList(A("ConditionStatus"))}`,
        );
      if (A("ConditionStatusCS"))
        push(
          `a condition status concept ${renderConceptSetSelection(A("ConditionStatusCS"), conceptSets)} concept set`,
        );
      if (A("VisitType")?.length)
        push(
          `a visit occurrence that is: ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "Death":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("DeathType")?.length)
        push(
          `a death type that${A("DeathTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("DeathType"))}`,
        );
      if (A("DeathTypeCS"))
        push(
          `a death type concept ${renderConceptSetSelection(A("DeathTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "DeviceExposure":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("DeviceType")?.length)
        push(
          `a device type that${A("DeviceTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("DeviceType"))}`,
        );
      if (A("DeviceTypeCS"))
        push(
          `a device type concept ${renderConceptSetSelection(A("DeviceTypeCS"), conceptSets)} concept set`,
        );
      if (A("UniqueDeviceId"))
        push(`unique device ID ${renderTextFilter(A("UniqueDeviceId"))}`);
      if (A("Quantity")) push(`quantity ${renderNumericRange(A("Quantity"))}`);
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider specialty concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("VisitType")?.length)
        push(
          `a visit occurrence that is: ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "DoseEra":
      push(renderEventDateCriteria(A("EraStartDate"), A("EraEndDate")));
      if (A("Unit")?.length) push(`unit is: ${renderConceptList(A("Unit"))}`);
      if (A("UnitCS"))
        push(
          `a unit concept ${renderConceptSetSelection(A("UnitCS"), conceptSets)} concept set`,
        );
      if (A("EraLength"))
        push(`with era length ${renderNumericRange(A("EraLength"))} days`);
      if (A("DoseValue"))
        push(`with dose value ${renderNumericRange(A("DoseValue"))}`);
      break;

    case "DrugEra":
      push(renderEventDateCriteria(A("EraStartDate"), A("EraEndDate")));
      if (A("EraLength"))
        push(`with era length ${renderNumericRange(A("EraLength"))} days`);
      if (A("OccurrenceCount"))
        push(
          `with occurrence count ${renderNumericRange(A("OccurrenceCount"))}`,
        );
      if (A("GapDays"))
        push(`with gap days ${renderNumericRange(A("GapDays"))}`);
      break;

    case "DrugExposure":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("DrugType")?.length)
        push(
          `a drug type that${A("DrugTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("DrugType"))}`,
        );
      if (A("DrugTypeCS"))
        push(
          `a drug type concept ${renderConceptSetSelection(A("DrugTypeCS"), conceptSets)} concept set`,
        );
      if (A("Refills"))
        push(`with refills ${renderNumericRange(A("Refills"))}`);
      if (A("Quantity"))
        push(`with quantity ${renderNumericRange(A("Quantity"))}`);
      if (A("DaysSupply"))
        push(`with days supply ${renderNumericRange(A("DaysSupply"))} days`);
      if (A("EffectiveDrugDose"))
        push(
          `with effective drug dose ${renderNumericRange(A("EffectiveDrugDose"))}`,
        );
      if (A("DoseUnit")?.length)
        push(`dose unit: ${renderConceptList(A("DoseUnit"))}`);
      if (A("DoseUnitCS"))
        push(
          `a dose unit concept ${renderConceptSetSelection(A("DoseUnitCS"), conceptSets)} concept set`,
        );
      if (A("RouteConcept")?.length)
        push(`with route: ${renderConceptList(A("RouteConcept"))}`);
      if (A("RouteConceptCS"))
        push(
          `a route concept ${renderConceptSetSelection(A("RouteConceptCS"), conceptSets)} concept set`,
        );
      if (A("LotNumber"))
        push(`lot number ${renderTextFilter(A("LotNumber"))}`);
      if (A("StopReason"))
        push(`with a stop reason ${renderTextFilter(A("StopReason"))}`);
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider specialty concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("VisitType")?.length)
        push(
          `a visit occurrence that is: ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "LocationRegion":
      push(renderEventDateCriteria(A("StartDate"), A("EndDate")));
      break;

    case "Measurement":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("MeasurementType")?.length)
        push(
          `a measurement type that${A("MeasurementTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("MeasurementType"))}`,
        );
      if (A("MeasurementTypeCS"))
        push(
          `a measurement type concept ${renderConceptSetSelection(A("MeasurementTypeCS"), conceptSets)} concept set`,
        );
      if (A("Operator")?.length)
        push(`with operator: ${renderConceptList(A("Operator"))}`);
      if (A("OperatorCS"))
        push(
          `an operator concept ${renderConceptSetSelection(A("OperatorCS"), conceptSets)} concept set`,
        );
      if (A("ValueAsNumber"))
        push(`numeric value ${renderNumericRange(A("ValueAsNumber"))}`);
      if (A("Unit")?.length) push(`unit: ${renderConceptList(A("Unit"))}`);
      if (A("UnitCS"))
        push(
          `a unit concept ${renderConceptSetSelection(A("UnitCS"), conceptSets)} concept set`,
        );
      if (A("ValueAsConcept")?.length)
        push(
          `with value as concept: ${renderConceptList(A("ValueAsConcept"))}`,
        );
      if (A("ValueAsConceptCS"))
        push(
          `a value as concept ${renderConceptSetSelection(A("ValueAsConceptCS"), conceptSets)} concept set`,
        );
      if (A("RangeLow")) push(`low range ${renderNumericRange(A("RangeLow"))}`);
      if (A("RangeHigh"))
        push(`high range ${renderNumericRange(A("RangeHigh"))}`);
      if (A("RangeLowRatio"))
        push(
          `low range-to-value ratio ${renderNumericRange(A("RangeLowRatio"))}`,
        );
      if (A("RangeHighRatio"))
        push(
          `high range-to-value ratio ${renderNumericRange(A("RangeHighRatio"))}`,
        );
      if (A("Abnormal") === true)
        push(
          "with an abnormal result (measurement value falls outside the low and high range)",
        );
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider speciality concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("VisitType")?.length)
        push(
          `a visit occurrence that is: ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "Observation":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("ObservationType")?.length)
        push(
          `an observation type that${A("ObservationTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("ObservationType"))}`,
        );
      if (A("ObservationTypeCS"))
        push(
          `an observation type concept ${renderConceptSetSelection(A("ObservationTypeCS"), conceptSets)} concept set`,
        );
      if (A("ValueAsNumber"))
        push(`numeric value ${renderNumericRange(A("ValueAsNumber"))}`);
      if (A("Unit")?.length) push(`unit: ${renderConceptList(A("Unit"))}`);
      if (A("UnitCS"))
        push(
          `an unit concept ${renderConceptSetSelection(A("UnitCS"), conceptSets)} concept set`,
        );
      if (A("ValueAsConcept")?.length)
        push(
          `with value as concept: ${renderConceptList(A("ValueAsConcept"))}`,
        );
      if (A("ValueAsConceptCS"))
        push(
          `a value as concept ${renderConceptSetSelection(A("ValueAsConceptCS"), conceptSets)} concept set`,
        );
      if (A("ValueAsString"))
        push(`with value as string ${renderTextFilter(A("ValueAsString"))}`);
      if (A("Qualifier")?.length)
        push(`with qualifier: ${renderConceptList(A("Qualifier"))}`);
      if (A("QualifierCS"))
        push(
          `a qualifier concept ${renderConceptSetSelection(A("QualifierCS"), conceptSets)} concept set`,
        );
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider speciality concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("VisitType")?.length)
        push(
          `a visit occurrence that is: ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "ObservationPeriod":
      push(renderEventDateCriteria(A("PeriodStartDate"), A("PeriodEndDate")));
      push(renderUserDefinedPeriod(A("UserDefinedPeriod")));
      if (A("PeriodType")?.length)
        push(`period type is: ${renderConceptList(A("PeriodType"))}`);
      if (A("PeriodTypeCS"))
        push(
          `a period type concept ${renderConceptSetSelection(A("PeriodTypeCS"), conceptSets)} concept set`,
        );
      if (A("PeriodLength"))
        push(`with a length ${renderNumericRange(A("PeriodLength"))} days`);
      break;

    case "ProcedureOccurrence":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("ProcedureType")?.length)
        push(
          `a procedure type that${A("ProcedureTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("ProcedureType"))}`,
        );
      if (A("ProcedureTypeCS"))
        push(
          `a procedure type concept ${renderConceptSetSelection(A("ProcedureTypeCS"), conceptSets)} concept set`,
        );
      if (A("Modifier")?.length)
        push(`with modifier: ${renderConceptList(A("Modifier"))}`);
      if (A("ModifierCS"))
        push(
          `a modifier concept ${renderConceptSetSelection(A("ModifierCS"), conceptSets)} concept set`,
        );
      if (A("Quantity"))
        push(`with quantity ${renderNumericRange(A("Quantity"))}`);
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider speciality concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("VisitType")?.length)
        push(
          `a visit occurrence that is: ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      break;

    case "Specimen":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("SpecimenType")?.length)
        push(
          `a specimen type that${A("SpecimenTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("SpecimenType"))}`,
        );
      if (A("SpecimenTypeCS"))
        push(
          `a specimen type concept ${renderConceptSetSelection(A("SpecimenTypeCS"), conceptSets)} concept set`,
        );
      if (A("Quantity"))
        push(`with quantity ${renderNumericRange(A("Quantity"))}`);
      if (A("Unit")?.length) push(`with unit: ${renderConceptList(A("Unit"))}`);
      if (A("UnitCS"))
        push(
          `an unit concept ${renderConceptSetSelection(A("UnitCS"), conceptSets)} concept set`,
        );
      if (A("AnatomicSite")?.length)
        push(`with anatomic site: ${renderConceptList(A("AnatomicSite"))}`);
      if (A("AnatomicSiteCS"))
        push(
          `an anatomic site concept ${renderConceptSetSelection(A("AnatomicSiteCS"), conceptSets)} concept set`,
        );
      if (A("DiseaseStatus")?.length)
        push(`with disease status: ${renderConceptList(A("DiseaseStatus"))}`);
      if (A("DiseaseStatusCS"))
        push(
          `a disease status concept ${renderConceptSetSelection(A("DiseaseStatusCS"), conceptSets)} concept set`,
        );
      if (A("SourceId"))
        push(`with source ID ${renderTextFilter(A("SourceId"))}`);
      break;

    case "VisitOccurrence":
      push(
        renderEventDateCriteria(
          A("OccurrenceStartDate"),
          A("OccurrenceEndDate"),
        ),
      );
      if (A("VisitType")?.length)
        push(
          `a visit type that${A("VisitTypeExclude") ? " is not:" : " is:"} ${renderConceptList(A("VisitType"))}`,
        );
      if (A("VisitTypeCS"))
        push(
          `a visit type concept ${renderConceptSetSelection(A("VisitTypeCS"), conceptSets)} concept set`,
        );
      if (A("ProviderSpecialty")?.length)
        push(
          `a provider specialty that is: ${renderConceptList(A("ProviderSpecialty"))}`,
        );
      if (A("ProviderSpecialtyCS"))
        push(
          `a provider speciality concept ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("PlaceOfServiceCS"))
        push(
          `a place of service that is ${renderConceptSetSelection(A("PlaceOfServiceCS"), conceptSets)} concept set`,
        );
      if (A("VisitLength"))
        push(`with length ${renderNumericRange(A("VisitLength"))} days`);
      break;

    case "VisitDetail":
      push(
        renderEventDateCriteria(
          A("VisitDetailStartDate"),
          A("VisitDetailEndDate"),
        ),
      );
      if (
        A("VisitDetailTypeCS")?.CodesetId ??
        A("VisitDetailTypeCS")?.codesetId
      )
        push(
          `a visit detail type that is ${renderConceptSetSelection(A("VisitDetailTypeCS"), conceptSets)} concept set`,
        );
      if (
        A("ProviderSpecialtyCS")?.CodesetId ??
        A("ProviderSpecialtyCS")?.codesetId
      )
        push(
          `a provider specialty that is ${renderConceptSetSelection(A("ProviderSpecialtyCS"), conceptSets)} concept set`,
        );
      if (A("PlaceOfServiceCS"))
        push(
          `a place of service that is ${renderConceptSetSelection(A("PlaceOfServiceCS"), conceptSets)} concept set`,
        );
      if (A("VisitDetailLength"))
        push(`with length ${renderNumericRange(A("VisitDetailLength"))} days`);
      break;
  }

  return attrs;
}

function renderCriteria(
  wrapper: CriteriaWrapper,
  conceptSets: ConceptSet[],
  level: number,
  isPlural = true,
  countCriteria: CountCriteria | null = null,
  indexLabel = "cohort entry",
): string {
  const type = criteriaTypeName(wrapper);
  if (!type) return "Unknown criteria type.";
  const c = wrapper[type] as Record<string, unknown>;
  const meta = TYPE_META[type] ?? {
    label: type.toLowerCase(),
    default: "any",
    source: null,
  };

  const attrs: string[] = [];
  if (countCriteria) {
    const wc = renderWindowCriteria(countCriteria, indexLabel);
    if (wc) attrs.push(wc);
  }
  const ageGender = renderAgeGender(c);
  if (ageGender) attrs.push(ageGender);
  const da = c["DateAdjustment"] ?? c["dateAdjustment"];
  if (da) {
    const daStr = renderDateAdjustment(da as DateAdjustment);
    if (daStr) attrs.push(daStr);
  }
  attrs.push(...buildTypeAttrs(type, c, conceptSets));

  const first = c["First"] ?? c["first"] ?? false;
  const codesetId = c["CodesetId"] ?? c["codesetId"];
  const csName = codesetName(
    codesetId as string | number | null | undefined,
    meta.default,
    conceptSets,
  );

  let desc = `${meta.label}${isPlural && !first ? "s" : ""} of ${csName}`;

  const sourceKey = meta.source;
  if (sourceKey) {
    const sourceId =
      c[sourceKey] ?? c[sourceKey.charAt(0).toLowerCase() + sourceKey.slice(1)];
    if (sourceId !== null && sourceId !== undefined) {
      desc += ` (including ${codesetName(sourceId as string | number, meta.default, conceptSets)} source concepts)`;
    }
  }

  if (type === "ObservationPeriod" && first) {
    desc += " (first observation period in person's history)";
  } else if (first) {
    desc += " for the first time in the person's history";
  }

  if (attrs.length > 0) desc += `, ${attrs.join("; ")}`;

  const corr = c["CorrelatedCriteria"] as CriteriaGroup | undefined;
  if (corr) {
    desc += `; ${renderGroup(corr, conceptSets, level, csName)}`;
  } else {
    desc += ".";
  }

  return desc;
}

// Group

const GROUP_TYPE_OPTIONS: Option[] = [
  { id: "ALL", name: "all" },
  { id: "ANY", name: "any" },
  { id: "AT_LEAST", name: "at least" },
  { id: "AT_MOST", name: "at most" },
];

const COUNT_TYPE_OPTIONS: Option[] = [
  { id: 1, name: "at most" },
  { id: 0, name: "exactly" },
  { id: 2, name: "at least" },
];

const COUNT_COLUMN_MAP: Record<string, string> = {
  DOMAIN_CONCEPT: "standard concepts",
  START_DATE: "start dates",
  VISIT_ID: "visits",
};

function renderDemographicCriteria(
  c: Record<string, unknown>,
  conceptSets: ConceptSet[],
  indexLabel = "cohort entry",
): string {
  const attrs: string[] = [];
  const ageGender = renderAgeGender(c);
  if (ageGender) attrs.push(ageGender);
  const startDate = c["OccurrenceStartDate"] ?? c["occurrenceStartDate"];
  const endDate = c["OccurrenceEndDate"] ?? c["occurrenceEndDate"];
  const dateStr = renderEventDateCriteria(
    startDate as DateRange | undefined,
    endDate as DateRange | undefined,
  );
  if (dateStr) attrs.push(dateStr);
  const race = c["Race"] ?? c["race"];
  if ((race as ConceptItem[] | undefined)?.length)
    attrs.push(`race is: ${renderConceptList(race as ConceptItem[])}`);
  const ethnicity = c["Ethnicity"] ?? c["ethnicity"];
  if ((ethnicity as ConceptItem[] | undefined)?.length)
    attrs.push(
      `ethnicity is: ${renderConceptList(ethnicity as ConceptItem[])}`,
    );
  if (attrs.length > 0)
    return `with the following event criteria: ${attrs.join("; ")}.`;
  return "any event (no demographic criteria specified).";
}

function renderCountCriteria(
  cc: CountCriteria,
  conceptSets: ConceptSet[],
  level: number,
  indexLabel = "cohort entry",
): string {
  const occ = cc.Occurrence ?? cc.occurrence ?? {};
  const occType = occ.Type ?? occ.type ?? 0;
  const occCount = occ.Count ?? occ.count ?? 0;
  const isDistinct = occ.IsDistinct ?? occ.isDistinct ?? false;
  const countCol =
    COUNT_COLUMN_MAP[occ.CountColumn ?? occ.countColumn ?? "DOMAIN_CONCEPT"] ??
    "standard concepts";

  const criteriaWrapper = cc.Criteria ?? cc.criteria;
  if (!criteriaWrapper) return "";

  let having: string;
  if (occType === 0 && occCount === 0) {
    having = "no";
  } else {
    having = `${optionName(COUNT_TYPE_OPTIONS, occType)} ${occCount}`;
  }

  const distinctPart = isDistinct ? ` distinct ${countCol} from` : "";
  const isPlural = occCount !== 1;
  const criteriaStr = renderCriteria(
    criteriaWrapper as CriteriaWrapper,
    conceptSets,
    level,
    isPlural,
    cc,
    indexLabel,
  );

  return `having ${having}${distinctPart} ${criteriaStr}`;
}

function renderGroup(
  group: CriteriaGroup,
  conceptSets: ConceptSet[],
  level: number,
  indexLabel = "cohort entry",
): string {
  const criteriaList = toSafeArray(group.CriteriaList ?? group.criteriaList);
  const demoList = toSafeArray(
    group.DemographicCriteriaList ?? group.demographicCriteriaList,
  );
  const groups = toSafeArray(group.Groups ?? group.groups);
  const type = group.Type ?? group.type ?? "ALL";
  const count = group.Count ?? group.count;
  const total = criteriaList.length + demoList.length + groups.length;

  const indent = "    ".repeat(level + 1);
  const typeName = optionName(GROUP_TYPE_OPTIONS, type);
  const isSimple =
    total === 1 && (type === "ANY" || type === "ALL") && groups.length === 0;

  if (!isSimple) {
    const header = `with ${typeName}${type.startsWith("AT_") ? " " + count : ""} of the following criteria:`;
    const lines = [header];
    let i = 1;
    for (const demo of demoList) {
      lines.push(
        `\n${indent}${i++}. ${renderDemographicCriteria(demo, conceptSets, indexLabel)}`,
      );
    }
    for (const cc of criteriaList) {
      lines.push(
        `\n${indent}${i++}. ${renderCountCriteria(cc, conceptSets, level + 1, indexLabel)}`,
      );
    }
    for (const sub of groups) {
      lines.push(
        `\n${indent}${i++}. ${renderGroup(sub, conceptSets, level + 1, indexLabel)}`,
      );
    }
    return lines.join("");
  }

  if (criteriaList.length === 1 && criteriaList[0] !== undefined)
    return renderCountCriteria(criteriaList[0], conceptSets, level, indexLabel);
  if (demoList.length === 1 && demoList[0] !== undefined)
    return renderDemographicCriteria(demoList[0], conceptSets, indexLabel);
  return "";
}

// End strategy

function renderStrategy(
  endStrategy: EndStrategy | null | undefined,
  conceptSets: ConceptSet[],
): string {
  if (!endStrategy || Object.keys(endStrategy).length === 0) {
    return "The person exits the cohort at the end of continuous observation.\n";
  }
  const ds = endStrategy.DateOffset ?? endStrategy.dateOffset;
  if (ds) {
    const field = optionName(
      DATE_OFFSET_FIELD_OPTIONS,
      ds.DateField ?? ds.dateField ?? "StartDate",
    );
    const offset = ds.Offset ?? ds.offset ?? 0;
    return `The cohort end date will be offset from index event's ${field} plus ${formatValue(offset, "day")}.\n`;
  }
  const ce = endStrategy.CustomEra ?? endStrategy.customEra;
  if (ce) {
    const drugId = ce.DrugCodesetId ?? ce.drugCodesetId;
    const drugName = codesetName(
      drugId,
      "_invalid drug specified_",
      conceptSets,
    );
    const gapDays = ce.GapDays ?? ce.gapDays ?? 0;
    const offset = ce.Offset ?? ce.offset ?? 0;
    const dso = ce.DaysSupplyOverride ?? ce.daysSupplyOverride;
    const supplyPart =
      dso !== null && dso !== undefined
        ? `forcing drug exposure days supply to: ${formatValue(dso, "day")}.`
        : "using days supply and exposure end date for exposure duration.";
    return `The cohort end date will be based on a continuous exposure to ${drugName}:\nallowing ${gapDays} days between exposures, adding ${formatValue(offset, "day")} after exposure ends, and ${supplyPart}\n`;
  }
  return "The person exits the cohort at the end of continuous observation.\n";
}

// Main export

export function renderCohortMarkdown(
  expressionJson: string | Record<string, unknown>,
): string {
  let expr: CohortExpression;
  try {
    expr = (
      typeof expressionJson === "string"
        ? JSON.parse(expressionJson)
        : expressionJson
    ) as CohortExpression;
  } catch {
    return "_Error: could not parse cohort expression._";
  }

  const rawCs = expr.ConceptSets ?? expr.conceptSets;
  const conceptSets: ConceptSet[] = Array.isArray(rawCs)
    ? rawCs.map((cs) => ({ id: cs.id, name: cs.name }))
    : [];

  const pc = expr.PrimaryCriteria ?? expr.primaryCriteria ?? {};
  const criteriaList = toSafeArray(pc.CriteriaList ?? pc.criteriaList);
  const obsWin = pc.ObservationWindow ?? pc.observationWindow ?? {};
  const primaryLimit: Limit = pc.PrimaryCriteriaLimit ??
    pc.primaryLimit ?? { Type: "All" };
  const additionalCriteria = expr.AdditionalCriteria ?? expr.additionalCriteria;
  const qualifiedLimit: Limit = expr.QualifiedLimit ??
    expr.qualifiedLimit ?? { Type: "All" };
  const expressionLimit: Limit = expr.ExpressionLimit ??
    expr.expressionLimit ?? { Type: "All" };
  const inclusionRules = toSafeArray(
    expr.InclusionRules ?? expr.inclusionRules,
  );
  const endStrategy = expr.EndStrategy ?? expr.endStrategy ?? {};
  const censoringCriteria = toSafeArray(
    expr.CensoringCriteria ?? expr.censoringCriteria,
  );
  const collapseSettings = expr.CollapseSettings ?? expr.collapseSettings ?? {};
  const censorWindow = expr.CensorWindow ?? expr.censorWindow ?? {};

  const lines: string[] = [];

  lines.push("### Cohort Entry Events\n");

  if (criteriaList.length > 0) {
    const priorDays = obsWin.PriorDays ?? obsWin.priorDays ?? 0;
    const postDays = obsWin.PostDays ?? obsWin.postDays ?? 0;

    let intro = "People";
    if (priorDays > 0 || postDays > 0) {
      intro += " with continuous observation of ";
      if (priorDays > 0) intro += `${priorDays} days before`;
      if (priorDays > 0 && postDays > 0) intro += " and ";
      if (postDays > 0) intro += `${postDays} days after`;
      intro += " event";
    }
    if (inclusionRules.length > 0 || additionalCriteria) intro += " may";
    intro += " enter the cohort when observing any of the following:";
    lines.push("\n" + intro + "\n");

    criteriaList.forEach((c, i) => {
      lines.push(
        `\n${i + 1}. ${renderCriteria(c as CriteriaWrapper, conceptSets, 0)}`,
      );
    });
    lines.push("\n");
  }

  const plType = primaryLimit.Type ?? primaryLimit.type ?? "All";
  if (plType !== "All") {
    lines.push(
      `\nLimit cohort entry events to the ${renderLimit(primaryLimit)} per person.\n`,
    );
  }

  if (additionalCriteria) {
    lines.push(
      `\nRestrict entry events to ${renderGroup(additionalCriteria, conceptSets, 0)}  \n`,
    );
    if (plType === "All") {
      const qlType = qualifiedLimit.Type ?? qualifiedLimit.type ?? "All";
      if (qlType !== "All") {
        lines.push(
          `\nLimit these restricted entry events to the ${renderLimit(qualifiedLimit)} per person.\n`,
        );
      }
    }
  }

  if (inclusionRules.length > 0) {
    lines.push("\n### Inclusion Criteria\n");
    inclusionRules.forEach((rule, i) => {
      const name = rule.name ?? rule.Name ?? "Unnamed Rule";
      const desc = rule.description ?? rule.Description;
      lines.push(`\n#### ${i + 1}. ${name}${desc ? ": " + desc + "  " : ""}\n`);
      const ruleExpr = rule.expression ?? rule.Expression ?? {};
      lines.push(`\nEntry events ${renderGroup(ruleExpr, conceptSets, 0)}\n`);
    });
  }

  if (plType === "All" && !additionalCriteria) {
    const elType = expressionLimit.Type ?? expressionLimit.type ?? "All";
    if (elType !== "All") {
      lines.push(
        `\nLimit qualifying entry events to the ${renderLimit(qualifiedLimit)} per person.\n`,
      );
    }
  }

  lines.push("\n### Cohort Exit\n\n");
  lines.push(renderStrategy(endStrategy as EndStrategy, conceptSets));

  if (censoringCriteria.length > 0) {
    lines.push(
      "\nThe person exits the cohort when encountering any of the following events:\n",
    );
    censoringCriteria.forEach((c, i) => {
      lines.push(
        `\n${i + 1}. ${renderCriteria(c as CriteriaWrapper, conceptSets, 0)}`,
      );
    });
    lines.push("\n");
  }

  const eraPad = collapseSettings.EraPad ?? collapseSettings.eraPad ?? 0;
  lines.push(
    `\n### Cohort Eras\n\nRemaining events will be combined into cohort eras if they are within ${eraPad} days of each other.\n`,
  );

  const cStart = censorWindow.StartDate ?? censorWindow.startDate;
  const cEnd = censorWindow.EndDate ?? censorWindow.endDate;
  if (cStart || cEnd) {
    lines.push("\n");
    if (cStart) lines.push(`Left censor cohort start dates to ${cStart}.  `);
    if (cEnd) lines.push(`\nRight censor cohort end dates to ${cEnd}`);
    lines.push("\n");
  }

  if (conceptSets.length > 0) {
    const fullCs = toSafeArray(expr.ConceptSets ?? expr.conceptSets);
    lines.push("\n### Concept Sets\n");
    for (const cs of fullCs) {
      lines.push(`\n#### ${cs.name}\n`);
      const items = toSafeArray(cs.expression?.items);
      if (items.length === 0) {
        lines.push("\nThere are no concept set items in this concept set.  \n");
      } else {
        lines.push(
          "\n|Concept ID|Concept Name|Code|Vocabulary|Excluded|Descendants|Mapped|\n",
        );
        lines.push(
          "|:---|:---------------------------------------|:--|:-----|:--:|:--:|:--:|\n",
        );
        for (const item of items) {
          const con = item.concept ?? {};
          lines.push(
            `|${con.CONCEPT_ID ?? con.conceptId ?? ""}` +
              `|${con.CONCEPT_NAME ?? con.conceptName ?? ""}` +
              `|${con.CONCEPT_CODE ?? con.conceptCode ?? ""}` +
              `|${con.VOCABULARY_ID ?? con.vocabularyId ?? ""}` +
              `|${renderCheckbox(item.isExcluded)}` +
              `|${renderCheckbox(item.includeDescendants)}` +
              `|${renderCheckbox(item.includeMapped)}|\n`,
          );
        }
        lines.push("\n");
      }
    }
  }

  return lines.join("");
}
