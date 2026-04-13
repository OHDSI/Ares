import { DEATH } from "@/shared/config/files";
import { sortByRange } from "@/shared/lib/utils";
import { parseYearMonth } from "@/shared/lib/formatters";
import { Death } from "@/processes/exploreReports/model/interfaces/files/Death";

export default function death(data) {
  const deathData: Death = data[DEATH];
  if (
    deathData.PREVALENCE_BY_GENDER_AGE_YEAR &&
    deathData.PREVALENCE_BY_GENDER_AGE_YEAR.length
  ) {
    deathData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
      deathData.PREVALENCE_BY_GENDER_AGE_YEAR,
      "ascending",
      "TRELLIS_NAME",
      "trellisOrder"
    );
  }
  if (deathData.PREVALENCE_BY_MONTH && deathData.PREVALENCE_BY_MONTH.length) {
    deathData.PREVALENCE_BY_MONTH.forEach((v, i) => {
      deathData.PREVALENCE_BY_MONTH[i].date = parseYearMonth(
        v.X_CALENDAR_MONTH.toString()
      );
    });
  }

  return {
    ...deathData,
  };
}
