import * as d3 from "d3-time-format";
import { OBSERVATION_PERIOD } from "@/shared/config/files";
import getPercentage from "@/shared/lib/get-percentage";
import sortByRange from "@/shared/lib/range-sort";
import { ObservationPeriodType } from "@/processes/exploreReports/model/interfaces/files/ObservationPeriodType";

export default function observationPeriod(data) {
  const dateParse = d3.timeParse("%Y%m");
  const observationPeriodData: ObservationPeriodType = data[OBSERVATION_PERIOD];
  const personPeriods = observationPeriodData.PERSON_PERIODS_DATA.map(
    (item) => ({
      ...item,
      PERCENT_PEOPLE: getPercentage(
        item.COUNT_VALUE,
        observationPeriodData.PERSON_PERIODS_DATA
      ),
    })
  );
  observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE = sortByRange(
    observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE,
    "ascending",
    "CATEGORY",
    "categoryOrder"
  );
  observationPeriodData.OBSERVED_BY_MONTH.forEach((v) => {
    v.DATE = dateParse(v.MONTH_YEAR.toString());
  });

  return {
    observationPeriodData,
    personPeriods,
  };
}
