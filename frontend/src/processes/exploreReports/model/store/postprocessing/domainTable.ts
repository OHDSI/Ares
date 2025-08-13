import {
  CONCEPT,
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
  METADATA,
} from "@/shared/config/files";
import { DomainSummary } from "@/processes/exploreReports/model/interfaces/files/DomainSummary";
import { DomainIssues } from "@/processes/exploreReports/model/interfaces/files/DomainIssues";
import { DomainDrugStratificationType } from "@/processes/exploreReports/model/interfaces/files/DomainDrugStratificationType";
import { DomainVisitStratificationType } from "@/processes/exploreReports/model/interfaces/files/DomainVisitStratificationType";
import * as d3 from "d3-time-format";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import environment from "@/shared/api/environment";
import sortByRange from "@/shared/lib/range-sort";

function domainTableData(data) {
  const metadataData = data[METADATA];
  const domainTable: DomainSummary[] = data[DOMAIN_SUMMARY];
  const domainIssues: DomainIssues[] = data[DOMAIN_ISSUES];
  const drugStratification: DomainDrugStratificationType[] =
    data[DOMAIN_DRUG_STRATIFICATION];
  const domainStratification: DomainVisitStratificationType[] =
    data[DOMAIN_VISIT_STRATIFICATION];

  return {
    domainTable,
    domainIssues,
    domainStratification,
    drugStratification,
    metadataData,
  };
}

function conceptData(data) {
  const dateParse = d3.timeParse("%Y%m");
  const metadata = data[CONCEPT_METADATA]?.[0];
  let conceptData: ConceptType;
  let conceptName: string | string[];
  let conceptId: number | number[];
  let numPersons: number | number[];
  let percentPersons: string | string[];
  let recordsPerPerson: string | string[];
  let countFailed: string | string[];
  let isNotStationary: boolean;
  let seasonalityScore: string | string[];
  let seasonalityComment: string;

  if (environment.DUCKDB_ENABLED) {
    if (metadata) {
      conceptData = { ...data, ...metadata };
    } else {
      conceptData = data;
    }
    conceptName = conceptData.CONCEPT_NAME;
    conceptId = conceptData.CONCEPT_ID;
    numPersons = conceptData.NUM_PERSONS;
    percentPersons = conceptData.PERCENT_PERSONS;
    recordsPerPerson = conceptData.RECORDS_PER_PERSON;
    countFailed = conceptData.COUNT_FAILED;
    if (conceptData.IS_STATIONARY) {
      isNotStationary = !conceptData.IS_STATIONARY;
    }
    if (conceptData.SEASONALITY_SCORE) {
      seasonalityScore = conceptData.SEASONALITY_SCORE;
    }
  } else {
    conceptData = data[CONCEPT];
    conceptName = conceptData.CONCEPT_NAME?.[0];
    conceptId = conceptData.CONCEPT_ID?.[0];
    numPersons = conceptData.NUM_PERSONS?.[0];
    percentPersons = conceptData.PERCENT_PERSONS?.[0];
    recordsPerPerson = conceptData.RECORDS_PER_PERSON?.[0];
    countFailed = conceptData.COUNT_FAILED?.[0];
    isNotStationary = !conceptData.IS_STATIONARY?.[0];
    seasonalityScore =
      conceptData.SEASONALITY_SCORE?.[0] || conceptData.SEASONALITY_SCORE;
  }

  if (seasonalityScore) {
    seasonalityComment = "Seasonality score of " + seasonalityScore + ".";
  }

  const domainSummary: DomainSummary = data[DOMAIN_SUMMARY];

  if (
    conceptData.PREVALENCE_BY_GENDER_AGE_YEAR &&
    conceptData.PREVALENCE_BY_GENDER_AGE_YEAR.length
  ) {
    conceptData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
      conceptData.PREVALENCE_BY_GENDER_AGE_YEAR,
      "ascending",
      "TRELLIS_NAME",
      "trellisOrder"
    );
  }

  if (
    conceptData.PREVALENCE_BY_MONTH &&
    conceptData.PREVALENCE_BY_MONTH.length
  ) {
    conceptData.PREVALENCE_BY_MONTH.forEach((v, i) => {
      conceptData.PREVALENCE_BY_MONTH[i].date = dateParse(
        v.X_CALENDAR_MONTH.toString()
      );
    });
  }

  const measurementTable =
    conceptData.MEASUREMENT_VALUE_DISTRIBUTION &&
    conceptData.MEASUREMENT_VALUE_DISTRIBUTION.length
      ? conceptData.MEASUREMENT_VALUE_DISTRIBUTION.map((value) => ({
          ...value,
          UNIT_COUNT: conceptData.RECORDS_BY_UNIT.filter(
            (val) => val.CONCEPT_NAME === value.CATEGORY
          )[0].COUNT_VALUE,
        }))
      : null;
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
    measurementTable,
  };
}

export default function domainTable(data) {
  if (data[CONCEPT] || data[CONCEPT_METADATA]) {
    return conceptData(data);
  } else {
    return domainTableData(data);
  }
}
