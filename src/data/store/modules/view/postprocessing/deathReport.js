import * as d3 from "d3-time-format";
import { DEATH } from "@/data/services/getFilePath";
import sortByRange from "@/services/range-sort";

export default function death(data) {
  const dateParse = d3.timeParse("%Y%m");
  const deathData = data[DEATH];
  deathData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
    deathData.PREVALENCE_BY_GENDER_AGE_YEAR,
    "ascending",
    "TRELLIS_NAME",
    "trellisOrder"
  );
  deathData.PREVALENCE_BY_MONTH.forEach((v, i) => {
    deathData.PREVALENCE_BY_MONTH[i].date = dateParse(v.X_CALENDAR_MONTH);
  });
  return {
    ...deathData,
  };
}
