export default function deriveResults(data /*: CheckResults[]*/) {
  // Verification Plausibility
  const VerificationPlausibilityPass = data.filter(
    (c) =>
      c.failed == 0 &&
      c.context == "Verification" &&
      c.category == "Plausibility"
  ).length;

  const VerificationPlausibilityFail = data.filter(
    (c) =>
      c.failed == 1 &&
      c.context == "Verification" &&
      c.category == "Plausibility"
  ).length;

  const VerificationPlausibilityTotal = data.filter(
    (c) => c.context == "Verification" && c.category == "Plausibility"
  ).length;

  const VerificationPlausibilityPercentPass =
    VerificationPlausibilityTotal == 0
      ? "-"
      : (
          (VerificationPlausibilityPass / VerificationPlausibilityTotal) *
          100
        ).toFixed(1) + "%";

  // Verification Conformance
  const VerificationConformancePass = data.filter(
    (c) =>
      c.failed == 0 &&
      c.context == "Verification" &&
      c.category == "Conformance"
  ).length;

  const VerificationConformanceFail = data.filter(
    (c) =>
      c.failed == 1 &&
      c.context == "Verification" &&
      c.category == "Conformance"
  ).length;

  const VerificationConformanceTotal = data.filter(
    (c) => c.context == "Verification" && c.category == "Conformance"
  ).length;

  const VerificationConformancePercentPass =
    VerificationConformanceTotal == 0
      ? "-"
      : (
          (VerificationConformancePass / VerificationConformanceTotal) *
          100
        ).toFixed(1) + "%";

  // Verification Completeness
  const VerificationCompletenessPass = data.filter(
    (c) =>
      c.failed == 0 &&
      c.context == "Verification" &&
      c.category == "Completeness"
  ).length;

  const VerificationCompletenessFail = data.filter(
    (c) =>
      c.failed == 1 &&
      c.context == "Verification" &&
      c.category == "Completeness"
  ).length;

  const VerificationCompletenessTotal = data.filter(
    (c) => c.context == "Verification" && c.category == "Completeness"
  ).length;

  const VerificationCompletenessPercentPass =
    VerificationCompletenessTotal == 0
      ? "-"
      : (
          (VerificationCompletenessPass / VerificationCompletenessTotal) *
          100
        ).toFixed(1) + "%";

  // Verification Totals
  const VerificationPass = data.filter(
    (c) => c.failed == 0 && c.context == "Verification"
  ).length;

  const VerificationFail = data.filter(
    (c) => c.failed == 1 && c.context == "Verification"
  ).length;

  const VerificationTotal = data.filter(
    (c) => c.context == "Verification"
  ).length;

  const VerificationPercentPass =
    VerificationTotal == 0
      ? "-"
      : ((VerificationPass / VerificationTotal) * 100).toFixed(1) + "%";

  // Validation Plausibility
  const ValidationPlausibilityPass = data.filter(
    (c) =>
      c.failed == 0 && c.context == "Validation" && c.category == "Plausibility"
  ).length;

  const ValidationPlausibilityFail = data.filter(
    (c) =>
      c.failed == 1 && c.context == "Validation" && c.category == "Plausibility"
  ).length;

  const ValidationPlausibilityTotal = data.filter(
    (c) => c.context == "Validation" && c.category == "Plausibility"
  ).length;

  const ValidationPlausibilityPercentPass =
    ValidationPlausibilityTotal == 0
      ? "-"
      : (
          (ValidationPlausibilityPass / ValidationPlausibilityTotal) *
          100
        ).toFixed(1) + "%";

  // Validation Conformance
  const ValidationConformancePass = data.filter(
    (c) =>
      c.failed == 0 && c.context == "Validation" && c.category == "Conformance"
  ).length;

  const ValidationConformanceFail = data.filter(
    (c) =>
      c.failed == 1 && c.context == "Validation" && c.category == "Conformance"
  ).length;

  const ValidationConformanceTotal = data.filter(
    (c) => c.context == "Validation" && c.category == "Conformance"
  ).length;

  const ValidationConformancePercentPass =
    ValidationConformanceTotal == 0
      ? "-"
      : (
          (ValidationConformancePass / ValidationConformanceTotal) *
          100
        ).toFixed(1) + "%";

  // Validation Completeness
  const ValidationCompletenessPass = data.filter(
    (c) =>
      c.failed == 0 && c.context == "Validation" && c.category == "Completeness"
  ).length;

  const ValidationCompletenessFail = data.filter(
    (c) =>
      c.failed == 1 && c.context == "Validation" && c.category == "Completeness"
  ).length;

  const ValidationCompletenessTotal = data.filter(
    (c) => c.context == "Validation" && c.category == "Completeness"
  ).length;

  const ValidationCompletenessPercentPass =
    ValidationCompletenessTotal == 0
      ? "-"
      : (
          (ValidationCompletenessPass / ValidationCompletenessTotal) *
          100
        ).toFixed(1) + "%";

  // Validation
  const ValidationPass = data.filter(
    (c) => c.failed == 0 && c.context == "Validation"
  ).length;

  const ValidationFail = data.filter(
    (c) => c.failed == 1 && c.context == "Validation"
  ).length;

  const ValidationTotal = data.filter((c) => c.context == "Validation").length;

  const ValidationPercentPass =
    ValidationTotal == 0
      ? "-"
      : ((ValidationPass / ValidationTotal) * 100).toFixed(1) + "%";

  // Plausibility
  const PlausibilityPass = data.filter(
    (c) => c.failed == 0 && c.category == "Plausibility"
  ).length;

  const PlausibilityFail = data.filter(
    (c) => c.failed == 1 && c.category == "Plausibility"
  ).length;

  const PlausibilityTotal = data.filter(
    (c) => c.category == "Plausibility"
  ).length;

  const PlausibilityPercentPass =
    PlausibilityTotal == 0
      ? "-"
      : ((PlausibilityPass / PlausibilityTotal) * 100).toFixed(1) + "%";

  // Conformance
  const ConformancePass = data.filter(
    (c) => c.failed == 0 && c.category == "Conformance"
  ).length;

  const ConformanceFail = data.filter(
    (c) => c.failed == 1 && c.category == "Conformance"
  ).length;

  const ConformanceTotal = data.filter(
    (c) => c.category == "Conformance"
  ).length;

  const ConformancePercentPass =
    ConformanceTotal == 0
      ? "-"
      : ((ConformancePass / ConformanceTotal) * 100).toFixed(1) + "%";

  // Completeness
  const CompletenessPass = data.filter(
    (c) => c.failed == 0 && c.category == "Completeness"
  ).length;

  const CompletenessFail = data.filter(
    (c) => c.failed == 1 && c.category == "Completeness"
  ).length;

  const CompletenessTotal = data.filter(
    (c) => c.category == "Completeness"
  ).length;

  const CompletenessPercentPass =
    CompletenessTotal == 0
      ? "-"
      : ((CompletenessPass / CompletenessTotal) * 100).toFixed(1) + "%";

  // All
  const AllPass = data.filter((c) => c.failed == 0).length;

  const AllFail = data.filter((c) => c.failed == 1).length;

  const AllTotal = data.length;

  const AllPercentPass =
    AllTotal == 0 ? "-" : ((AllPass / AllTotal) * 100).toFixed(1) + "%";

  for (let i = 0; i < data.length; i++) {
    if (data[i].failed == 0) {
      data[i].failed = "PASS";
    } else {
      data[i].failed = "FAIL";
    }

    if (data[i].NOTES == undefined) {
      data[i].NOTES_EXIST = "None";
    } else {
      data[i].NOTES_EXIST = "Exists";
    }

    if (!data[i].CDM_FIELD_NAME) {
      data[i].CDM_FIELD_NAME = "N/A";
    } else {
      data[i].CDM_FIELD_NAME = data[i].CDM_FIELD_NAME.toUpperCase();
    }
  }

  const derivedResults = {
    Verification: {
      Plausibility: {
        Pass: VerificationPlausibilityPass,
        Fail: VerificationPlausibilityFail,
        Total: VerificationPlausibilityTotal,
        PercentPass: VerificationPlausibilityPercentPass,
      },
      Conformance: {
        Pass: VerificationConformancePass,
        Fail: VerificationConformanceFail,
        Total: VerificationConformanceTotal,
        PercentPass: VerificationConformancePercentPass,
      },
      Completeness: {
        Pass: VerificationCompletenessPass,
        Fail: VerificationCompletenessFail,
        Total: VerificationCompletenessTotal,
        PercentPass: VerificationCompletenessPercentPass,
      },
      Total: {
        Pass: VerificationPass,
        Fail: VerificationFail,
        Total: VerificationTotal,
        PercentPass: VerificationPercentPass,
      },
    },
    Validation: {
      Plausibility: {
        Pass: ValidationPlausibilityPass,
        Fail: ValidationPlausibilityFail,
        Total: ValidationPlausibilityTotal,
        PercentPass: ValidationPlausibilityPercentPass,
      },
      Conformance: {
        Pass: ValidationConformancePass,
        Fail: ValidationConformanceFail,
        Total: ValidationConformanceTotal,
        PercentPass: ValidationConformancePercentPass,
      },
      Completeness: {
        Pass: ValidationCompletenessPass,
        Fail: ValidationCompletenessFail,
        Total: ValidationCompletenessTotal,
        PercentPass: ValidationCompletenessPercentPass,
      },
      Total: {
        Pass: ValidationPass,
        Fail: ValidationFail,
        Total: ValidationTotal,
        PercentPass: ValidationPercentPass,
      },
    },
    Total: {
      Plausibility: {
        Pass: PlausibilityPass,
        Fail: PlausibilityFail,
        Total: PlausibilityTotal,
        PercentPass: PlausibilityPercentPass,
      },
      Conformance: {
        Pass: ConformancePass,
        Fail: ConformanceFail,
        Total: ConformanceTotal,
        PercentPass: ConformancePercentPass,
      },
      Completeness: {
        Pass: CompletenessPass,
        Fail: CompletenessFail,
        Total: CompletenessTotal,
        PercentPass: CompletenessPercentPass,
      },
      Total: {
        Pass: AllPass,
        Fail: AllFail,
        Total: AllTotal,
        PercentPass: AllPercentPass,
      },
    },
  };

  return derivedResults;
}
