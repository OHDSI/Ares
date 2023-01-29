import sortByRange from "@/shared/lib/range-sort";
import * as d3 from "d3-time-format";
import { CONCEPT, DOMAIN_SUMMARY } from "@/shared/config/files";
import * as d3Format from "d3-format";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import { DomainSummary } from "@/processes/exploreReports/model/interfaces/files/DomainSummary";

export default function concept(data) {
  const dateParse = d3.timeParse("%Y%m");
  const conceptData: ConceptType = data[CONCEPT];
  const domainSummary: DomainSummary = data[DOMAIN_SUMMARY];
  const conceptName: string = conceptData.CONCEPT_NAME[0];
  const conceptId: number = conceptData.CONCEPT_ID[0];
  const numPersons: string = d3Format.format(",")(conceptData.NUM_PERSONS[0]);
  const percentPersons: string = conceptData.PERCENT_PERSONS[0];
  const recordsPerPerson: string = conceptData.RECORDS_PER_PERSON[0];
  let countFailed: string;
  let isNotStationary: boolean;
  let seasonalityScore: string;
  let seasonalityComment: string;

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
    conceptData.PREVALENCE_BY_MONTH[i].date = dateParse(
      v.X_CALENDAR_MONTH.toString()
    );
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
