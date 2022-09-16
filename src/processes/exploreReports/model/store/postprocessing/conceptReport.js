import sortByRange from "@/shared/lib/range-sort";
import * as d3 from "d3-time-format";
import { CONCEPT, DOMAIN_SUMMARY } from "@/shared/config/files";
import * as d3Format from "d3-format";

export default function concept(data) {
  const dateParse = d3.timeParse("%Y%m");
  const conceptData = data[CONCEPT];
  const domainSummary = data[DOMAIN_SUMMARY];
  const conceptName = conceptData.CONCEPT_NAME[0];
  const conceptId = conceptData.CONCEPT_ID[0];
  const numPersons = d3Format.format(",")(conceptData.NUM_PERSONS[0]);
  const percentPersons = conceptData.PERCENT_PERSONS[0];
  const recordsPerPerson = conceptData.RECORDS_PER_PERSON[0];
  let countFailed;
  let isNotStationary;
  let seasonalityScore;
  let seasonalityComment;

  if (conceptData.COUNT_FAILED) {
    countFailed = conceptData.COUNT_FAILED[0];
  }

  if (conceptData.IS_STATIONARY) {
    isNotStationary = !conceptData.IS_STATIONARY[0];
  }

  if (conceptData.SEASONALITY_SCORE) {
    seasonalityScore = conceptData.SEASONALITY_SCORE[0];
    seasonalityComment = "Seasonality score of " + seasonalityScore + ".";
  }

  conceptData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
    conceptData.PREVALENCE_BY_GENDER_AGE_YEAR,
    "ascending",
    "TRELLIS_NAME",
    "trellisOrder"
  );

  conceptData.PREVALENCE_BY_MONTH.forEach((v, i) => {
    conceptData.PREVALENCE_BY_MONTH[i].date = dateParse(v.X_CALENDAR_MONTH);
  });
  return {
    conceptData,
    conceptName,
    conceptId,
    numPersons,
    countFailed,
    isNotStationary,
    seasonalityScore,
    seasonalityComment,
    percentPersons,
    recordsPerPerson,
    domainSummary,
  };
}
