import * as files from "./files";
import { DOMAIN_SUMMARY } from "@/shared/config/files";

function getDuckDBTables(params = [{}]) {
  return {
    condition_occurrence: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.CONDITIONS_BY_TYPE, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.AGE_AT_FIRST_DIAGNOSIS, instanceParams: [params] },
    ],
    measurement: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_OCCURRENCE, instanceParams: [params] },
      { name: files.FREQUENCY_DISTRIBUTION, instanceParams: [params] },
      { name: files.LOWER_LIMIT_DISTRIBUTION, instanceParams: [params] },
      { name: files.MEASUREMENTS_BY_TYPE, instanceParams: [params] },
      { name: files.MEASUREMENT_VALUE_DISTRIBUTION, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.RECORDS_BY_UNIT, instanceParams: [params] },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
      { name: files.UPPER_LIMIT_DISTRIBUTION, instanceParams: [params] },
      { name: files.VALUES_RELATIVE_TO_NORM, instanceParams: [params] },
      {
        name: DOMAIN_SUMMARY,
        required: true,
        source: "axios",
        instanceParams: [params],
      },
    ],
    condition_era: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.AGE_AT_FIRST_EXPOSURE, instanceParams: [params] },
      { name: files.LENGTH_OF_ERA, instanceParams: [params] },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
    ],
    drug_exposure: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_EXPOSURE, instanceParams: [params] },
      { name: files.DAYS_SUPPLY_DISTRIBUTION, instanceParams: [params] },
      { name: files.DRUGS_BY_TYPE, instanceParams: [params] },
      { name: files.DRUG_FREQUENCY_DISTRIBUTION, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.QUANTITY_DISTRIBUTION, instanceParams: [params] },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
      { name: files.REFILLS_DISTRIBUTION, instanceParams: [params] },
    ],
    drug_era: [],
    visit_occurrence: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_OCCURRENCE, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
      { name: files.VISIT_DURATION_BY_TYPE, instanceParams: [params] },
    ],
    visit_detail: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_OCCURRENCE, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.VISIT_DETAIL_DURATION_BY_TYPE, instanceParams: [params] },
    ],
    observation: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_OCCURRENCE, instanceParams: [params] },
      { name: files.OBSERVATIONS_BY_TYPE, instanceParams: [params] },
      { name: files.OBS_FREQUENCY_DISTRIBUTION, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
    ],
    procedure_occurrence: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_OCCURRENCE, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.PROCEDURES_BY_TYPE, instanceParams: [params] },
      {
        name: files.PROCEDURE_FREQUENCY_DISTRIBUTION,
        instanceParams: [params],
      },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
    ],
    device_exposure: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.AGE_AT_FIRST_EXPOSURE, instanceParams: [params] },
      { name: files.DEVICES_BY_TYPE, instanceParams: [params] },
      { name: files.DEVICE_FREQUENCY_DISTRIBUTION, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.RECORDS_PER_PERSON, instanceParams: [params] },
    ],
  };
}

export default getDuckDBTables;
