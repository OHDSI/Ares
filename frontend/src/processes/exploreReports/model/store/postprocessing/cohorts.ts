import {
  COHORT_CHARACTERIZATION,
  COHORT_INDEX_EVENT_BREAKDOWN,
  COHORT_TEMPORAL_COVARIATE_DISTRIBUTION,
} from "@/shared/config/files";

export default function cohorts(data) {
  if (data[COHORT_CHARACTERIZATION]) {
    const characterizationTable = data[COHORT_CHARACTERIZATION].map((val) => ({
      ...val,
      mean: parseFloat(val.mean),
      sd: parseFloat(val.sd),
      temporal_choice: val.temporal_choice || "N/A",
    }));
    const indexEventBreakdownTable = data[COHORT_INDEX_EVENT_BREAKDOWN];
    const timeMeasures = [
      "observation time (days) prior to index",
      "observation time (days) after index",
      "time (days) between cohort start and end",
    ];
    const timeDistribution = data[
      COHORT_TEMPORAL_COVARIATE_DISTRIBUTION
    ].filter((val) => {
      return timeMeasures.includes(val.covariate_name);
    });
    return {
      characterizationTable,
      indexEventBreakdownTable,
      timeDistribution,
    };
  } else {
    return data;
  }
}
