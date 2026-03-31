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

export function classifyDomain(name: string | null | undefined): Domain {
  const lower = name?.toLowerCase() ?? "";
  const first = lower.split(/\s/)[0];
  if (lower.includes("condition_") || first === "condition") return "Condition";
  if (lower.includes("drug_") || first === "drug") return "Drug";
  if (lower.includes("procedure_") || first === "procedure") return "Procedure";
  if (lower.includes("measurement_") || first === "measurement") return "Measurement";
  if (lower.includes("observation_") || first === "observation") return "Observation";
  if (lower.includes("device_") || first === "device") return "Device";
  if (lower.includes("cohort_") || first === "cohort") return "Cohort";
  if (lower.includes("visit_") || first === "visit") return "Visit";
  return "Demographic";
}

export const domainColors: Record<Domain, string> = {
  Condition: "#4e79a7",
  Drug: "#f28e2b",
  Procedure: "#e15759",
  Measurement: "#76b7b2",
  Observation: "#59a14f",
  Device: "#edc948",
  Cohort: "#b07aa1",
  Visit: "#ff9da7",
  Demographic: "#9c755f",
};
