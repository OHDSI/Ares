import type { ParsedCovariateName } from "#types/index.js";
export type { ParsedCovariateName };

export function parseCovariateNameString(
  name: string | null | undefined,
): ParsedCovariateName {
  const empty: ParsedCovariateName = {
    domain: null,
    concept: null,
    timeWindow: "temporal",
    windowDays: null,
    subType: null,
    detail: null,
  };
  if (!name) return empty;

  let timeWindow: ParsedCovariateName["timeWindow"] = "temporal";
  let windowDays: string | null = null;
  let s = name;
  let m: RegExpMatchArray | null;

  const conceptCountWindowRe =
    /\s+during day (.*?) through (.*?) concept_count relative to index/i;
  const anyTimePriorRe =
    /\s+(?:during\s+)?any time prior through (-?\d+) days relative to index/i;
  const duringDayRe =
    /\s+during day (-?\d+) through (-?\d+) days relative to index/i;

  if ((m = s.match(conceptCountWindowRe))) {
    timeWindow = "window";
    windowDays = `${m[1]} to ${m[2]}`;
    s = s.replace(conceptCountWindowRe, "");
  } else if ((m = s.match(anyTimePriorRe))) {
    timeWindow = "any_time_prior";
    windowDays = `any to ${m[1]}`;
    s = s.replace(anyTimePriorRe, "");
  } else if ((m = s.match(duringDayRe))) {
    timeWindow = "window";
    windowDays = `${m[1]} to ${m[2]}`;
    s = s.replace(duringDayRe, "");
  }

  const tw = { timeWindow, windowDays };

  if (/^Gender\s*=/.test(s))
    return {
      domain: "HDPS",
      concept: s.replace(/^Gender\s*=\s*/, "").trim(),
      ...tw,
      subType: "gender",
      detail: null,
    };
  if (/^Race\s*=/.test(s))
    return {
      domain: "HDPS",
      concept: s.replace(/^Race\s*=\s*/, "").trim(),
      ...tw,
      subType: "race",
      detail: null,
    };
  if (/^Age group:\s*/.test(s))
    return {
      domain: "HDPS",
      concept: s.replace(/^Age group:\s*/, "").trim(),
      ...tw,
      subType: "age_group",
      detail: null,
    };
  if (/^Index year:\s*/.test(s))
    return {
      domain: "HDPS",
      concept: s.replace(/^Index year:\s*/, "").trim(),
      ...tw,
      subType: "index_year",
      detail: null,
    };
  if (/^Index month:\s*/.test(s))
    return {
      domain: "HDPS",
      concept: s.replace(/^Index month:\s*/, "").trim(),
      ...tw,
      subType: "index_month",
      detail: null,
    };

  if (/^index month:\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^index month:\s*/i, "").trim(),
      ...tw,
      subType: "index_month",
      detail: null,
    };
  if (/^index year and month:\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^index year and month:\s*/i, "").trim(),
      ...tw,
      subType: "index_year_month",
      detail: null,
    };
  if (/^index year:\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^index year:\s*/i, "").trim(),
      ...tw,
      subType: "index_year",
      detail: null,
    };
  if (/^age group:\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^age group:\s*/i, "").trim(),
      ...tw,
      subType: "age_group",
      detail: null,
    };
  if (/^gender\s*=\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^gender\s*=\s*/i, "").trim(),
      ...tw,
      subType: "gender",
      detail: null,
    };
  if (/^race\s*=\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^race\s*=\s*/i, "").trim(),
      ...tw,
      subType: "race",
      detail: null,
    };
  if (/^ethnicity\s*=\s*/i.test(s))
    return {
      domain: "Demographics",
      concept: s.replace(/^ethnicity\s*=\s*/i, "").trim(),
      ...tw,
      subType: "ethnicity",
      detail: null,
    };
  if (/^age in years$/i.test(s))
    return {
      domain: "Demographics",
      concept: "age in years",
      ...tw,
      subType: "age",
      detail: null,
    };
  if ((m = s.match(/^observation time \(days\) (after|prior to) index$/i)))
    return {
      domain: "Demographics",
      concept: `observation time ${m[1]} index`,
      ...tw,
      subType: "observation_time",
      detail: "days",
    };
  if (/^time \(days\) between cohort start and end$/i.test(s))
    return {
      domain: "Demographics",
      concept: "time between cohort start and end",
      ...tw,
      subType: "cohort_duration",
      detail: "days",
    };

  if (/^care site ID\s*=\s*/i.test(s))
    return {
      domain: "CareSite",
      concept: s.replace(/^care site ID\s*=\s*/i, "").trim(),
      ...tw,
      subType: "care_site",
      detail: null,
    };

  if (/^cohort count:\s*/i.test(s))
    return {
      domain: "Cohort",
      concept: s.replace(/^cohort count:\s*/i, "").trim(),
      ...tw,
      subType: "cohort_count",
      detail: null,
    };
  if (/^cohort:\s*/i.test(s))
    return {
      domain: "Cohort",
      concept: s.replace(/^cohort:\s*/i, "").trim(),
      ...tw,
      subType: "cohort",
      detail: null,
    };

  if (
    (m = s.match(
      /^measurement (below normal range|above normal range|within normal range):\s*/i,
    ))
  ) {
    return {
      domain: "Measurement",
      concept: s.replace(m[0], "").trim(),
      ...tw,
      subType: "range",
      detail: m[1] ?? null,
    };
  }

  if (/^measurement value:\s*/i.test(s)) {
    const rest = s.replace(/^measurement value:\s*/i, "");
    const unitMatch = rest.match(/\s*\(([^)]+)\)\s*$/);
    if (unitMatch)
      return {
        domain: "Measurement",
        concept: rest.replace(/\s*\([^)]+\)\s*$/, "").trim(),
        ...tw,
        subType: "value",
        detail: unitMatch[1] ?? null,
      };
    return {
      domain: "Measurement",
      concept: rest.trim(),
      ...tw,
      subType: "value",
      detail: null,
    };
  }

  if (/^measurement:\s*/i.test(s)) {
    const rest = s.replace(/^measurement:\s*/i, "");
    const eqIdx = rest.indexOf(" = ");
    if (eqIdx >= 0)
      return {
        domain: "Measurement",
        concept: rest.slice(0, eqIdx).trim(),
        ...tw,
        subType: "value_as_concept",
        detail: rest.slice(eqIdx + 3).trim(),
      };
    return {
      domain: "Measurement",
      concept: rest.trim(),
      ...tw,
      subType: "binary",
      detail: null,
    };
  }

  if (
    (m = s.match(
      /^3-digit ICD-9 occurrence record of inpatient diagnosis observed during 180d on or prior to cohort index(?:\s+with freq >= (median|q75))?:\s*/i,
    ))
  ) {
    const freqThreshold = m[1] ? `freq >= ${m[1]}` : null;
    const rest = s.replace(m[0], "");
    const dashIdx = rest.indexOf("-");
    const code = dashIdx >= 0 ? rest.slice(0, dashIdx) : null;
    const concept = dashIdx >= 0 ? rest.slice(dashIdx + 1).trim() : rest.trim();
    return {
      domain: "HDPS",
      concept,
      ...tw,
      subType: "icd9_inpatient",
      detail: [code, freqThreshold].filter(Boolean).join(", ") || null,
    };
  }

  if (
    (m = s.match(
      /^3-digit ICD-9 occurrence record of ambulatory diagnosis observed during 180d on or prior to cohort index(?:\s+with freq >= (median|q75))?:\s*/i,
    ))
  ) {
    const freqThreshold = m[1] ? `freq >= ${m[1]}` : null;
    const rest = s.replace(m[0], "");
    const dashIdx = rest.indexOf("-");
    const code = dashIdx >= 0 ? rest.slice(0, dashIdx) : null;
    const concept = dashIdx >= 0 ? rest.slice(dashIdx + 1).trim() : rest.trim();
    return {
      domain: "HDPS",
      concept,
      ...tw,
      subType: "icd9_ambulatory",
      detail: [code, freqThreshold].filter(Boolean).join(", ") || null,
    };
  }

  if (
    (m = s.match(
      /^Ingredient prescription record observed during 180d on or prior to cohort index(?: with freq > (median|q75))?:\s+/i,
    ))
  ) {
    const freqThreshold = m[1] ? `freq > ${m[1]}` : null;
    const rest = s.replace(m[0], "");
    const dashIdx = rest.indexOf("-");
    const concept = dashIdx >= 0 ? rest.slice(dashIdx + 1).trim() : rest.trim();
    return {
      domain: "HDPS",
      concept,
      ...tw,
      subType: "ingredient",
      detail: freqThreshold,
    };
  }

  if (
    (m = s.match(
      /^Inpatient procedure occurrence record observed during 180d on or prior to cohort index(?: with freq >= (median|q75))?:\s+/i,
    ))
  ) {
    const freqThreshold = m[1] ? `freq >= ${m[1]}` : null;
    const rest = s.replace(m[0], "");
    const dashIdx = rest.indexOf("-");
    const concept = dashIdx >= 0 ? rest.slice(dashIdx + 1).trim() : rest.trim();
    return {
      domain: "HDPS",
      concept,
      ...tw,
      subType: "procedure_inpatient",
      detail: freqThreshold,
    };
  }

  if (
    (m = s.match(
      /^ambulatory procedure occurrence record observed during 180d on or prior to cohort index(?: with freq >= (median|q75))?:\s+/i,
    ))
  ) {
    const freqThreshold = m[1] ? `freq >= ${m[1]}` : null;
    const rest = s.replace(m[0], "");
    const dashIdx = rest.indexOf("-");
    const concept = dashIdx >= 0 ? rest.slice(dashIdx + 1).trim() : rest.trim();
    return {
      domain: "HDPS",
      concept,
      ...tw,
      subType: "procedure_ambulatory",
      detail: freqThreshold,
    };
  }

  if ((m = s.match(/^(\w+) concept count:\s*/i))) {
    return {
      domain: m[1] ?? "",
      concept: s.replace(m[0], "").trim(),
      ...tw,
      subType: "concept_count",
      detail: null,
    };
  }

  if ((m = s.match(/^(\w+) group(?:\s*\(([^)]+)\))?([^:]*):\s*/i))) {
    const inpatient = /, \(inpatient\)$/i.test(s);
    const concept = s
      .replace(m[0], "")
      .replace(/, \(inpatient\)$/i, "")
      .trim();
    const trailingPhrase = m[3]?.trim() || null;
    const detail =
      [m[2] ?? null, trailingPhrase, inpatient ? "inpatient" : null]
        .filter(Boolean)
        .join(", ") || null;
    return { domain: m[1] ?? "", concept, ...tw, subType: "group", detail };
  }

  if ((m = s.match(/^(\w+) during ([^:]+):\s*/i))) {
    const concept = s.replace(m[0], "").trim();
    return {
      domain: m[1] ?? "",
      concept,
      ...tw,
      subType: "binary",
      detail: m[2]?.trim() ?? "",
    };
  }

  if ((m = s.match(/^(\w+):\s*/i))) {
    const rest = s.replace(m[0], "");
    const eqIdx = rest.indexOf(" = ");
    if (eqIdx >= 0)
      return {
        domain: m[1] ?? "",
        concept: rest.slice(0, eqIdx).trim(),
        ...tw,
        subType: "value_as_concept",
        detail: rest.slice(eqIdx + 3).trim(),
      };
    const inpatient = /, \(inpatient\)$/i.test(rest);
    const concept = rest.replace(/, \(inpatient\)$/i, "").trim();
    return {
      domain: m[1] ?? "",
      concept,
      ...tw,
      subType: "binary",
      detail: inpatient ? "inpatient" : null,
    };
  }

  return { ...empty, concept: s.trim(), timeWindow, windowDays };
}
