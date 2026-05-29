interface SubsetOperator {
  subsetType: string;
  name?: string;
  [key: string]: unknown;
}

interface CohortSubsetOperator extends SubsetOperator {
  subsetType: "CohortSubsetOperator";
  cohortIds?: number[];
  negate?: boolean;
}

interface LimitSubsetOperator extends SubsetOperator {
  subsetType: "LimitSubsetOperator";
  priorTime?: number;
  followUpTime?: number;
  limitTo?: string;
}

interface DemographicSubsetOperator extends SubsetOperator {
  subsetType: "DemographicSubsetOperator";
  ageMin?: number | null;
  ageMax?: number | null;
  AgeMin?: number | null;
  AgeMax?: number | null;
  gender?:
    | string
    | Array<{
        conceptId?: number;
        conceptName?: string;
        CONCEPT_NAME?: string;
      }>;
  Gender?:
    | string
    | Array<{
        conceptId?: number;
        conceptName?: string;
        CONCEPT_NAME?: string;
      }>;
}

interface DurationSubsetOperator extends SubsetOperator {
  subsetType: "DurationSubsetOperator";
  minDays?: number;
  maxDays?: number;
}

const LIMIT_TO_LABELS: Record<string, string> = {
  firstEver: "first ever",
  lastEver: "last ever",
  firstInPeriod: "first in period",
  lastInPeriod: "last in period",
};

function renderCohortSubset(
  op: CohortSubsetOperator,
  cohortNames: Map<number, string>,
): string {
  const ids = op.cohortIds ?? [];
  if (ids.length === 0) return "";
  const names = ids.map(
    (id) => `**${cohortNames.get(id) ?? `Cohort #${id}`}**`,
  );
  const list =
    names.length === 1
      ? names[0]!
      : names.slice(0, -1).join(", ") + " or " + names[names.length - 1]!;
  const verb = op.negate ? "not in" : "in";
  return `Restricted to patients ${verb} ${list}`;
}

function renderLimitSubset(op: LimitSubsetOperator): string {
  const parts: string[] = [];
  if (op.limitTo) {
    parts.push(
      `Limited to the **${LIMIT_TO_LABELS[op.limitTo] ?? op.limitTo}** cohort entry per person`,
    );
  }
  if (op.priorTime && op.priorTime > 0) {
    parts.push(
      `Requires ≥ **${op.priorTime}** days of prior continuous observation`,
    );
  }
  if (op.followUpTime && op.followUpTime > 0) {
    parts.push(
      `Requires ≥ **${op.followUpTime}** days of follow-up observation`,
    );
  }
  return parts.join("\n\n");
}

function renderDurationSubset(op: DurationSubsetOperator): string {
  const parts: string[] = [];
  if (op.minDays != null)
    parts.push(`Minimum cohort duration ≥ **${op.minDays}** days`);
  if (op.maxDays != null)
    parts.push(`Maximum cohort duration ≤ **${op.maxDays}** days`);
  return parts.join("\n\n");
}

function renderDemographicSubset(op: DemographicSubsetOperator): string {
  const parts: string[] = [];
  const ageMin = op.ageMin ?? op.AgeMin;
  const ageMax = op.ageMax ?? op.AgeMax;
  if (ageMin != null && ageMax != null) {
    parts.push(
      `Age between **${ageMin}** and **${ageMax}** years at cohort entry`,
    );
  } else if (ageMin != null) {
    parts.push(`Age ≥ **${ageMin}** years at cohort entry`);
  } else if (ageMax != null) {
    parts.push(`Age ≤ **${ageMax}** years at cohort entry`);
  }
  const rawGender = op.gender ?? op.Gender;
  let genderLabel = "";
  if (typeof rawGender === "string" && rawGender) {
    genderLabel = rawGender.toLowerCase();
  } else if (Array.isArray(rawGender) && rawGender.length > 0) {
    const names = rawGender
      .map((g) => g.conceptName ?? g.CONCEPT_NAME ?? "")
      .filter(Boolean)
      .map((n) => n.toLowerCase());
    genderLabel = names.join(", ");
  }
  if (genderLabel) parts.push(`Gender: **${genderLabel}**`);
  return parts.join("\n\n");
}

export function renderSubsetMarkdown(
  json: string | null | undefined,
  cohortNames: Map<number, string>,
): string {
  if (!json) return "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return "_Error: could not parse subset definition._";
  }

  const defs = Array.isArray(parsed) ? parsed : [parsed];
  const lines: string[] = [];

  for (const def of defs as Array<{ subsetOperators?: SubsetOperator[] }>) {
    for (const op of def.subsetOperators ?? []) {
      let rendered = "";
      if (op.subsetType === "CohortSubsetOperator") {
        rendered = renderCohortSubset(op as CohortSubsetOperator, cohortNames);
      } else if (op.subsetType === "LimitSubsetOperator") {
        rendered = renderLimitSubset(op as LimitSubsetOperator);
      } else if (op.subsetType === "DemographicSubsetOperator") {
        rendered = renderDemographicSubset(op as DemographicSubsetOperator);
      } else if (op.subsetType === "DurationSubsetOperator") {
        rendered = renderDurationSubset(op as DurationSubsetOperator);
      } else {
        rendered = op.name ?? op.subsetType;
      }
      if (rendered) lines.push(rendered);
    }
  }

  return lines.map((l) => `- ${l}`).join("\n");
}

export function extractSubsetCohortIds(
  json: string | null | undefined,
): number[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    const defs = Array.isArray(parsed) ? parsed : [parsed];
    const ids: number[] = [];
    for (const def of defs as Array<{ subsetOperators?: SubsetOperator[] }>) {
      for (const op of def.subsetOperators ?? []) {
        if (op.subsetType === "CohortSubsetOperator") {
          for (const id of (op as CohortSubsetOperator).cohortIds ?? []) {
            ids.push(id);
          }
        }
      }
    }
    return ids;
  } catch {
    return [];
  }
}
