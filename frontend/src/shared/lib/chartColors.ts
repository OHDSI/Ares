export type Domain =
  | "Condition"
  | "Drug"
  | "Procedure"
  | "Measurement"
  | "Observation"
  | "Device"
  | "Cohort"
  | "Visit"
  | "Demographic";

type GenderKey = "Male" | "Female";
type DqCategoryKey = "Completeness" | "Conformance" | "Plausibility";

interface ColorScheme {
  label: string;
  palette: string[];
  genderColors: Record<GenderKey, string>;
  dqCategoryColors: Record<DqCategoryKey, string>;
  domainColors: Record<Domain, string>;
}

export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  "okabe-ito": {
    label: "Okabe-Ito",
    palette: [
      "#0072B2",
      "#E69F00",
      "#009E73",
      "#56B4E9",
      "#D55E00",
      "#CC79A7",
      "#F0E442",
      "#000000",
      "#332288",
      "#882255",
      "#44AA99",
      "#DDCC77",
    ],
    genderColors: { Male: "#0072B2", Female: "#D55E00" },
    dqCategoryColors: {
      Completeness: "#56B4E9",
      Conformance: "#E69F00",
      Plausibility: "#D55E00",
    },
    domainColors: {
      Condition: "#0072B2",
      Drug: "#E69F00",
      Procedure: "#D55E00",
      Measurement: "#56B4E9",
      Observation: "#009E73",
      Device: "#F0E442",
      Cohort: "#CC79A7",
      Visit: "#555555",
      Demographic: "#888888",
    },
  },
  tableau: {
    label: "Tableau Classic",
    palette: [
      "#4E79A7",
      "#F28E2B",
      "#E15759",
      "#76B7B2",
      "#59A14F",
      "#EDC948",
      "#AF7AA1",
      "#9C755F",
      "#79706E",
      "#D4A6C8",
      "#86BCB6",
      "#FFBE7D",
    ],
    genderColors: { Male: "#4E79A7", Female: "#E15759" },
    dqCategoryColors: {
      Completeness: "#4E79A7",
      Conformance: "#F28E2B",
      Plausibility: "#E15759",
    },
    domainColors: {
      Condition: "#4E79A7",
      Drug: "#F28E2B",
      Procedure: "#E15759",
      Measurement: "#76B7B2",
      Observation: "#59A14F",
      Device: "#EDC948",
      Cohort: "#AF7AA1",
      Visit: "#9C755F",
      Demographic: "#BAB0AC",
    },
  },
  "soft-earth": {
    label: "Soft Earth",
    palette: [
      "#5B7E9E",
      "#6B9A5A",
      "#5C8A99",
      "#7A5EA3",
      "#3A8C8C",
      "#9C7040",
      "#A06480",
      "#777777",
      "#4A6741",
      "#8B3E2F",
      "#2B5F8F",
      "#C49A6C",
    ],
    genderColors: { Male: "#5B7E9E", Female: "#C27C3A" },
    dqCategoryColors: {
      Completeness: "#5B7E9E",
      Conformance: "#C27C3A",
      Plausibility: "#A06480",
    },
    domainColors: {
      Condition: "#5B7E9E",
      Drug: "#C27C3A",
      Procedure: "#A06480",
      Measurement: "#3A8C8C",
      Observation: "#6B9A5A",
      Device: "#9C7040",
      Cohort: "#7A5EA3",
      Visit: "#777777",
      Demographic: "#999999",
    },
  },
  "high-contrast": {
    label: "High Contrast",
    palette: [
      "#1F77B4",
      "#FF7F0E",
      "#D62728",
      "#9467BD",
      "#2CA02C",
      "#17BECF",
      "#E377C2",
      "#7F7F7F",
      "#BCBD22",
      "#8C564B",
      "#393B79",
      "#637939",
    ],
    genderColors: { Male: "#1F77B4", Female: "#D62728" },
    dqCategoryColors: {
      Completeness: "#1F77B4",
      Conformance: "#FF7F0E",
      Plausibility: "#D62728",
    },
    domainColors: {
      Condition: "#1F77B4",
      Drug: "#FF7F0E",
      Procedure: "#D62728",
      Measurement: "#17BECF",
      Observation: "#2CA02C",
      Device: "#E377C2",
      Cohort: "#9467BD",
      Visit: "#7F7F7F",
      Demographic: "#999999",
    },
  },
};

export const COLOR_SCHEME_KEYS = Object.keys(COLOR_SCHEMES) as Array<
  keyof typeof COLOR_SCHEMES
>;

const _initial = COLOR_SCHEMES["okabe-ito"];

export const PALETTE: string[] = [..._initial.palette];
export const genderColors: Record<GenderKey, string> = {
  ..._initial.genderColors,
};
export const dqCategoryColors: Record<DqCategoryKey, string> = {
  ..._initial.dqCategoryColors,
};
export const domainColors: Record<Domain, string> = {
  ..._initial.domainColors,
};

export function setColorScheme(name: string): void {
  const scheme = COLOR_SCHEMES[name] ?? COLOR_SCHEMES["okabe-ito"];
  PALETTE.length = 0;
  PALETTE.push(...scheme.palette);
  Object.assign(genderColors, scheme.genderColors);
  Object.assign(dqCategoryColors, scheme.dqCategoryColors);
  Object.assign(domainColors, scheme.domainColors);
}

export function getGenderColor(name: string, pool: string[] = PALETTE): string {
  const lower = name.toLowerCase().trim();
  if (lower === "male" || lower === "m") return genderColors.Male;
  if (lower === "female" || lower === "f") return genderColors.Female;
  return getConceptColor(name, pool);
}

export function classifyDomain(name: string | null | undefined): Domain {
  const lower = name?.toLowerCase() ?? "";
  const first = lower.split(/\s/)[0];
  if (lower.startsWith("condition_") || first === "condition")
    return "Condition";
  if (lower.startsWith("drug_") || first === "drug") return "Drug";
  if (lower.startsWith("procedure_") || first === "procedure")
    return "Procedure";
  if (lower.startsWith("measurement_") || first === "measurement")
    return "Measurement";
  if (lower.startsWith("observation_") || first === "observation")
    return "Observation";
  if (lower.startsWith("device_") || first === "device") return "Device";
  if (lower.startsWith("cohort_") || first === "cohort") return "Cohort";
  if (lower.startsWith("visit_") || first === "visit") return "Visit";
  return "Demographic";
}

function hashIndex(name: string, len: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % len;
}

export function getConceptColor(
  name: string,
  pool: string[] = PALETTE,
): string {
  return pool[hashIndex(name, pool.length)];
}

const RACE_CONCEPT_ORDER = [
  "white",
  "black or african american",
  "asian",
  "american indian or alaska native",
  "native hawaiian or other pacific islander",
  "other race",
  "more than one race",
  "multiple races",
  "no matching concept",
  "unknown racial group",
  "unknown",
  "refuse to answer",
  "no information",
  "declined to specify",
];

const ETHNICITY_CONCEPT_ORDER = [
  "hispanic or latino",
  "not hispanic or latino",
  "no matching concept",
  "unknown",
  "no information",
];

export function getRaceConceptColor(
  name: string,
  pool: string[] = PALETTE,
): string {
  const normalized = name.toLowerCase().trim();
  const idx = RACE_CONCEPT_ORDER.indexOf(normalized);
  if (idx >= 0)
    return idx < pool.length ? pool[idx] : getConceptColor(name, pool);
  return getConceptColor(name, pool);
}

export function getEthnicityConceptColor(
  name: string,
  pool: string[] = PALETTE,
): string {
  const normalized = name.toLowerCase().trim();
  const idx = ETHNICITY_CONCEPT_ORDER.indexOf(normalized);
  if (idx >= 0)
    return idx < pool.length ? pool[idx] : getConceptColor(name, pool);
  return getConceptColor(name, pool);
}

const CDM_TABLE_ORDER = [
  "condition occurrence",
  "drug exposure",
  "measurement",
  "observation",
  "procedure occurrence",
  "visit occurrence",
  "device exposure",
  "death",
  "condition era",
  "drug era",
  "dose era",
  "observation period",
  "visit detail",
  "note",
  "specimen",
  "episode",
  "episode event",
  "fact relationship",
  "payer plan period",
];

export function getCdmDomainColor(
  name: string,
  pool: string[] = PALETTE,
): string {
  const normalized = name.toLowerCase().replace(/_/g, " ").trim();
  const idx = CDM_TABLE_ORDER.indexOf(normalized);
  if (idx >= 0)
    return idx < pool.length ? pool[idx] : getConceptColor(name, pool);
  return getConceptColor(name, pool);
}

export function colorSeries(
  names: string[],
  pool: string[] = PALETTE,
): Record<string, string> {
  const result: Record<string, string> = {};
  [...names].sort().forEach((name, i) => {
    result[name] = pool[i % pool.length];
  });
  return result;
}
