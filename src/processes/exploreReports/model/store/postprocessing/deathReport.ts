import * as d3 from "d3-time-format";
import { DEATH } from "@/shared/config/files";
import sortByRange from "@/shared/lib/range-sort";
import { Death } from "@/processes/exploreReports/model/interfaces/files/Death";

export default function death(data) {
  const dateParse = d3.timeParse("%Y%m");
  const deathData: Death = data[DEATH];
  deathData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
    deathData.PREVALENCE_BY_GENDER_AGE_YEAR,
    "ascending",
    "TRELLIS_NAME",
    "trellisOrder"
  );
  deathData.PREVALENCE_BY_MONTH.forEach((v, i) => {
    deathData.PREVALENCE_BY_MONTH[i].date = dateParse(
      v.X_CALENDAR_MONTH.toString()
    );
  });
  return {
    ...deathData,
  };
}
