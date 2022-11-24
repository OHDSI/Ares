export default function deriveResults(dqResults) {
  // Verification Plausibility
  const VerificationPlausibilityPass = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 0 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Plausibility"
  ).length;

  const VerificationPlausibilityFail = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Plausibility"
  ).length;

  const VerificationPlausibilityError = dqResults.CheckResults.filter(
    (c) =>
      c.IS_ERROR == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Plausibility"
  ).length;

  const VerificationPlausibilityNotApplicable = dqResults.CheckResults.filter(
    (c) =>
      c.NOT_APPLICABLE == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Plausibility"
  ).length;

  const VerificationPlausibilityTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Verification" && c.CATEGORY == "Plausibility"
  ).length;

  const VerificationPlausibilityPercentPass =
    VerificationPlausibilityTotal == 0
      ? "-"
      : (
          (VerificationPlausibilityPass / VerificationPlausibilityTotal) *
          100
        ).toFixed(1) + "%";

  // Verification Conformance
  const VerificationConformancePass = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 0 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Conformance"
  ).length;

  const VerificationConformanceFail = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Conformance"
  ).length;

  const VerificationConformanceError = dqResults.CheckResults.filter(
    (c) =>
      c.IS_ERROR == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Conformance"
  ).length;

  const VerificationConformanceNotApplicable = dqResults.CheckResults.filter(
    (c) =>
      c.NOT_APPLICABLE == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Conformance"
  ).length;

  const VerificationConformanceTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Verification" && c.CATEGORY == "Conformance"
  ).length;

  const VerificationConformancePercentPass =
    VerificationConformanceTotal == 0
      ? "-"
      : (
          (VerificationConformancePass / VerificationConformanceTotal) *
          100
        ).toFixed(1) + "%";

  // Verification Completeness
  const VerificationCompletenessPass = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 0 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Completeness"
  ).length;

  const VerificationCompletenessFail = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Completeness"
  ).length;

  const VerificationCompletenessError = dqResults.CheckResults.filter(
    (c) =>
      c.IS_ERROR == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Completeness"
  ).length;

  const VerificationCompletenessNotApplicable = dqResults.CheckResults.filter(
    (c) =>
      c.NOT_APPLICABLE == 1 &&
      c.CONTEXT == "Verification" &&
      c.CATEGORY == "Completeness"
  ).length;

  const VerificationCompletenessTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Verification" && c.CATEGORY == "Completeness"
  ).length;

  const VerificationCompletenessPercentPass =
    VerificationCompletenessTotal == 0
      ? "-"
      : (
          (VerificationCompletenessPass / VerificationCompletenessTotal) *
          100
        ).toFixed(1) + "%";

  // Verification Totals
  const VerificationPass = dqResults.CheckResults.filter(
    (c) => c.FAILED == 0 && c.CONTEXT == "Verification"
  ).length;

  const VerificationFail = dqResults.CheckResults.filter(
    (c) => c.FAILED == 1 && c.CONTEXT == "Verification"
  ).length;

  const VerificationError = dqResults.CheckResults.filter(
    (c) => c.IS_ERROR == 1 && c.CONTEXT == "Verification"
  ).length;

  const VerificationNotApplicable = dqResults.CheckResults.filter(
    (c) => c.NOT_APPLICABLE == 1 && c.CONTEXT == "Verification"
  ).length;

  const VerificationTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Verification"
  ).length;

  const VerificationPercentPass =
    VerificationTotal == 0
      ? "-"
      : ((VerificationPass / VerificationTotal) * 100).toFixed(1) + "%";

  // Validation Plausibility
  const ValidationPlausibilityPass = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 0 && c.CONTEXT == "Validation" && c.CATEGORY == "Plausibility"
  ).length;

  const ValidationPlausibilityFail = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 1 && c.CONTEXT == "Validation" && c.CATEGORY == "Plausibility"
  ).length;

  const ValidationPlausibilityError = dqResults.CheckResults.filter(
    (c) =>
      c.IS_ERROR == 1 &&
      c.CONTEXT == "Validation" &&
      c.CATEGORY == "Plausibility"
  ).length;

  const ValidationPlausibilityNotApplicable = dqResults.CheckResults.filter(
    (c) =>
      c.NOT_APPLICABLE == 1 &&
      c.CONTEXT == "Validation" &&
      c.CATEGORY == "Plausibility"
  ).length;

  const ValidationPlausibilityTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Validation" && c.CATEGORY == "Plausibility"
  ).length;

  const ValidationPlausibilityPercentPass =
    ValidationPlausibilityTotal == 0
      ? "-"
      : (
          (ValidationPlausibilityPass / ValidationPlausibilityTotal) *
          100
        ).toFixed(1) + "%";

  // Validation Conformance
  const ValidationConformancePass = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 0 && c.CONTEXT == "Validation" && c.CATEGORY == "Conformance"
  ).length;

  const ValidationConformanceFail = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 1 && c.CONTEXT == "Validation" && c.CATEGORY == "Conformance"
  ).length;

  const ValidationConformanceError = dqResults.CheckResults.filter(
    (c) =>
      c.IS_ERROR == 1 &&
      c.CONTEXT == "Validation" &&
      c.CATEGORY == "Conformance"
  ).length;

  const ValidationConformanceNotApplicable = dqResults.CheckResults.filter(
    (c) =>
      c.NOT_APPLICABLE == 1 &&
      c.CONTEXT == "Validation" &&
      c.CATEGORY == "Conformance"
  ).length;

  const ValidationConformanceTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Validation" && c.CATEGORY == "Conformance"
  ).length;

  const ValidationConformancePercentPass =
    ValidationConformanceTotal == 0
      ? "-"
      : (
          (ValidationConformancePass / ValidationConformanceTotal) *
          100
        ).toFixed(1) + "%";

  // Validation Completeness
  const ValidationCompletenessPass = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 0 && c.CONTEXT == "Validation" && c.CATEGORY == "Completeness"
  ).length;

  const ValidationCompletenessFail = dqResults.CheckResults.filter(
    (c) =>
      c.FAILED == 1 && c.CONTEXT == "Validation" && c.CATEGORY == "Completeness"
  ).length;

  const ValidationCompletenessError = dqResults.CheckResults.filter(
    (c) =>
      c.IS_ERROR == 1 &&
      c.CONTEXT == "Validation" &&
      c.CATEGORY == "Completeness"
  ).length;

  const ValidationCompletenessNotApplicable = dqResults.CheckResults.filter(
    (c) =>
      c.NOT_APPLICABLE == 1 &&
      c.CONTEXT == "Validation" &&
      c.CATEGORY == "Completeness"
  ).length;

  const ValidationCompletenessTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Validation" && c.CATEGORY == "Completeness"
  ).length;

  const ValidationCompletenessPercentPass =
    ValidationCompletenessTotal == 0
      ? "-"
      : (
          (ValidationCompletenessPass / ValidationCompletenessTotal) *
          100
        ).toFixed(1) + "%";

  // Validation
  const ValidationPass = dqResults.CheckResults.filter(
    (c) => c.FAILED == 0 && c.CONTEXT == "Validation"
  ).length;

  const ValidationFail = dqResults.CheckResults.filter(
    (c) => c.FAILED == 1 && c.CONTEXT == "Validation"
  ).length;

  const ValidationError = dqResults.CheckResults.filter(
    (c) => c.IS_ERROR == 1 && c.CONTEXT == "Validation"
  ).length;

  const ValidationNotApplicable = dqResults.CheckResults.filter(
    (c) => c.NOT_APPLICABLE == 1 && c.CONTEXT == "Validation"
  ).length;

  const ValidationTotal = dqResults.CheckResults.filter(
    (c) => c.CONTEXT == "Validation"
  ).length;

  const ValidationPercentPass =
    ValidationTotal == 0
      ? "-"
      : ((ValidationPass / ValidationTotal) * 100).toFixed(1) + "%";

  // Plausibility
  const PlausibilityPass = dqResults.CheckResults.filter(
    (c) => c.FAILED == 0 && c.CATEGORY == "Plausibility"
  ).length;

  const PlausibilityFail = dqResults.CheckResults.filter(
    (c) => c.FAILED == 1 && c.CATEGORY == "Plausibility"
  ).length;

  const PlausibilityError = dqResults.CheckResults.filter(
    (c) => c.IS_ERROR == 1 && c.CATEGORY == "Plausibility"
  ).length;

  const PlausibilityNotApplicable = dqResults.CheckResults.filter(
    (c) => c.NOT_APPLICABLE == 1 && c.CATEGORY == "Plausibility"
  ).length;

  const PlausibilityTotal = dqResults.CheckResults.filter(
    (c) => c.CATEGORY == "Plausibility"
  ).length;

  const PlausibilityPercentPass =
    PlausibilityTotal == 0
      ? "-"
      : ((PlausibilityPass / PlausibilityTotal) * 100).toFixed(1) + "%";

  // Conformance
  const ConformancePass = dqResults.CheckResults.filter(
    (c) => c.FAILED == 0 && c.CATEGORY == "Conformance"
  ).length;

  const ConformanceFail = dqResults.CheckResults.filter(
    (c) => c.FAILED == 1 && c.CATEGORY == "Conformance"
  ).length;

  const ConformanceError = dqResults.CheckResults.filter(
    (c) => c.IS_ERROR == 1 && c.CATEGORY == "Conformance"
  ).length;

  const ConformanceNotApplicable = dqResults.CheckResults.filter(
    (c) => c.NOT_APPLICABLE == 1 && c.CATEGORY == "Conformance"
  ).length;

  const ConformanceTotal = dqResults.CheckResults.filter(
    (c) => c.CATEGORY == "Conformance"
  ).length;

  const ConformancePercentPass =
    ConformanceTotal == 0
      ? "-"
      : ((ConformancePass / ConformanceTotal) * 100).toFixed(1) + "%";

  // Completeness
  const CompletenessPass = dqResults.CheckResults.filter(
    (c) => c.FAILED == 0 && c.CATEGORY == "Completeness"
  ).length;

  const CompletenessFail = dqResults.CheckResults.filter(
    (c) => c.FAILED == 1 && c.CATEGORY == "Completeness"
  ).length;

  const CompletenessError = dqResults.CheckResults.filter(
    (c) => c.IS_ERROR == 1 && c.CATEGORY == "Completeness"
  ).length;

  const CompletenessNotApplicable = dqResults.CheckResults.filter(
    (c) => c.NOT_APPLICABLE == 1 && c.CATEGORY == "Completeness"
  ).length;

  const CompletenessTotal = dqResults.CheckResults.filter(
    (c) => c.CATEGORY == "Completeness"
  ).length;

  const CompletenessPercentPass =
    CompletenessTotal == 0
      ? "-"
      : ((CompletenessPass / CompletenessTotal) * 100).toFixed(1) + "%";

  // All
  const AllPass = dqResults.CheckResults.filter((c) => c.FAILED == 0).length;

  const AllFail = dqResults.CheckResults.filter((c) => c.FAILED == 1).length;

  const AllError = dqResults.CheckResults.filter(
    (c) => c.IS_ERROR === 1
  ).length;

  const AllNotApplicable = dqResults.CheckResults.filter(
    (c) => c.NOT_APPLICABLE === 1
  ).length;

  const AllTotal = dqResults.CheckResults.length;

  const AllPercentPass =
    AllTotal == 0 ? "-" : ((AllPass / AllTotal) * 100).toFixed(1) + "%";

  for (let i = 0; i < dqResults.CheckResults.length; i++) {
    if (dqResults.CheckResults[i].FAILED == 0) {
      dqResults.CheckResults[i].FAILED = "PASS";
    } else {
      dqResults.CheckResults[i].FAILED = "FAIL";
    }

    if (dqResults.CheckResults[i].NOTES == undefined) {
      dqResults.CheckResults[i].NOTES_EXIST = "None";
    } else {
      dqResults.CheckResults[i].NOTES_EXIST = "Exists";
    }

    if (!dqResults.CheckResults[i].CDM_FIELD_NAME) {
      dqResults.CheckResults[i].CDM_FIELD_NAME = "N/A";
    } else {
      dqResults.CheckResults[i].CDM_FIELD_NAME =
        dqResults.CheckResults[i].CDM_FIELD_NAME.toUpperCase();
    }
  }

  const derivedResults = {
    Verification: {
      Plausibility: {
        Pass: VerificationPlausibilityPass,
        Fail: VerificationPlausibilityFail,
        Error: VerificationPlausibilityError,
        NotApplicable: VerificationPlausibilityNotApplicable,
        Total: VerificationPlausibilityTotal,
        PercentPass: VerificationPlausibilityPercentPass,
      },
      Conformance: {
        Pass: VerificationConformancePass,
        Fail: VerificationConformanceFail,
        Error: VerificationConformanceError,
        NotApplicable: VerificationConformanceNotApplicable,
        Total: VerificationConformanceTotal,
        PercentPass: VerificationConformancePercentPass,
      },
      Completeness: {
        Pass: VerificationCompletenessPass,
        Fail: VerificationCompletenessFail,
        Error: VerificationCompletenessError,
        NotApplicable: VerificationCompletenessNotApplicable,
        Total: VerificationCompletenessTotal,
        PercentPass: VerificationCompletenessPercentPass,
      },
      Total: {
        Pass: VerificationPass,
        Fail: VerificationFail,
        Error: VerificationError,
        NotApplicable: VerificationNotApplicable,
        Total: VerificationTotal,
        PercentPass: VerificationPercentPass,
      },
    },
    Validation: {
      Plausibility: {
        Pass: ValidationPlausibilityPass,
        Fail: ValidationPlausibilityFail,
        Error: ValidationPlausibilityError,
        NotApplicable: ValidationPlausibilityNotApplicable,
        Total: ValidationPlausibilityTotal,
        PercentPass: ValidationPlausibilityPercentPass,
      },
      Conformance: {
        Pass: ValidationConformancePass,
        Fail: ValidationConformanceFail,
        Error: ValidationConformanceError,
        NotApplicable: ValidationConformanceNotApplicable,
        Total: ValidationConformanceTotal,
        PercentPass: ValidationConformancePercentPass,
      },
      Completeness: {
        Pass: ValidationCompletenessPass,
        Fail: ValidationCompletenessFail,
        Error: ValidationCompletenessError,
        NotApplicable: ValidationCompletenessNotApplicable,
        Total: ValidationCompletenessTotal,
        PercentPass: ValidationCompletenessPercentPass,
      },
      Total: {
        Pass: ValidationPass,
        Fail: ValidationFail,
        Error: ValidationError,
        NotApplicable: ValidationNotApplicable,
        Total: ValidationTotal,
        PercentPass: ValidationPercentPass,
      },
    },
    Total: {
      Plausibility: {
        Pass: PlausibilityPass,
        Fail: PlausibilityFail,
        Error: PlausibilityError,
        NotApplicable: PlausibilityNotApplicable,
        Total: PlausibilityTotal,
        PercentPass: PlausibilityPercentPass,
      },
      Conformance: {
        Pass: ConformancePass,
        Fail: ConformanceFail,
        Error: ConformanceError,
        NotApplicable: ConformanceNotApplicable,
        Total: ConformanceTotal,
        PercentPass: ConformancePercentPass,
      },
      Completeness: {
        Pass: CompletenessPass,
        Fail: CompletenessFail,
        Error: CompletenessError,
        NotApplicable: CompletenessNotApplicable,
        Total: CompletenessTotal,
        PercentPass: CompletenessPercentPass,
      },
      Total: {
        Pass: AllPass,
        Fail: AllFail,
        Error: AllError,
        NotApplicable: AllNotApplicable,
        Total: AllTotal,
        PercentPass: AllPercentPass,
      },
    },
  };

  return derivedResults;
}
