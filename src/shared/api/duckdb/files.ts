import {
  COHORT_CHARACTERIZATION,
  COHORT_INDEX,
  COHORT_INDEX_EVENT_BREAKDOWN,
  COHORT_TEMPORAL_COVARIATE_DISTRIBUTION,
} from "@/shared/config/files";

export const CONCEPT_METADATA = "CONCEPT_METADATA";
export const DAYS_SUPPLY_DISTRIBUTION = "DAYS_SUPPLY_DISTRIBUTION";
export const DEVICE_FREQUENCY_DISTRIBUTION = "DEVICE_FREQUENCY_DISTRIBUTION";
export const DRUG_FREQUENCY_DISTRIBUTION = "DRUG_FREQUENCY_DISTRIBUTION";
export const FREQUENCY_DISTRIBUTION = "FREQUENCY_DISTRIBUTION";
export const LENGTH_OF_ERA = "LENGTH_OF_ERA";
export const MEASUREMENT_VALUE_DISTRIBUTION = "MEASUREMENT_VALUE_DISTRIBUTION";
export const OBS_FREQUENCY_DISTRIBUTION = "OBS_FREQUENCY_DISTRIBUTION";
export const PREVALENCE_BY_MONTH = "PREVALENCE_BY_MONTH";
export const PROCEDURE_FREQUENCY_DISTRIBUTION =
  "PROCEDURE_FREQUENCY_DISTRIBUTION";
export const QUANTITY_DISTRIBUTION = "QUANTITY_DISTRIBUTION";
export const RECORDS_BY_UNIT = "RECORDS_BY_UNIT";
export const REFILLS_DISTRIBUTION = "REFILLS_DISTRIBUTION";
export const VISIT_DETAIL_DURATION_BY_TYPE = "VISIT_DETAIL_DURATION_BY_TYPE";
export const VISIT_DURATION_BY_TYPE = "VISIT_DURATION_BY_TYPE";
export const PREVALENCE_BY_GENDER_AGE_YEAR = "PREVALENCE_BY_GENDER_AGE_YEAR";
export const AGE_AT_FIRST_DIAGNOSIS = "AGE_AT_FIRST_DIAGNOSIS";
export const CONDITIONS_BY_TYPE = "CONDITIONS_BY_TYPE";
export const AGE_AT_FIRST_OCCURRENCE = "AGE_AT_FIRST_OCCURRENCE";
export const LOWER_LIMIT_DISTRIBUTION = "LOWER_LIMIT_DISTRIBUTION";
export const MEASUREMENTS_BY_TYPE = "MEASUREMENTS_BY_TYPE";
export const RECORDS_PER_PERSON = "RECORDS_PER_PERSON";
export const UPPER_LIMIT_DISTRIBUTION = "UPPER_LIMIT_DISTRIBUTION";
export const VALUES_RELATIVE_TO_NORM = "VALUES_RELATIVE_TO_NORM";
export const AGE_AT_FIRST_EXPOSURE = "AGE_AT_FIRST_EXPOSURE";
export const DRUGS_BY_TYPE = "DRUGS_BY_TYPE";
export const DEVICES_BY_TYPE = "DEVICES_BY_TYPE";
export const PROCEDURES_BY_TYPE = "PROCEDURES_BY_TYPE";
export const OBSERVATIONS_BY_TYPE = "OBSERVATIONS_BY_TYPE";

function getFilePath(params: { cdm: string; release: string }) {
  const getUrl = window.location;
  const baseUrl =
    getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split("/")[1];
  return {
    [CONCEPT_METADATA]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/concept_metadata.parquet`,
    [DAYS_SUPPLY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/days_supply_distribution.parquet`,
    [DEVICE_FREQUENCY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/device_frequency_distribution.parquet`,
    [DRUG_FREQUENCY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/drug_frequency_distribution.parquet`,
    [FREQUENCY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/frequency_distribution.parquet`,
    [LENGTH_OF_ERA]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/length_of_era.parquet`,
    [MEASUREMENT_VALUE_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/measurement_value_distribution.parquet`,
    [OBS_FREQUENCY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/obs_frequency_distribution.parquet`,
    [PREVALENCE_BY_MONTH]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/prevalence_by_month.parquet`,
    [PROCEDURE_FREQUENCY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/procedure_frequency_distribution.parquet`,
    [QUANTITY_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/quantity_distribution.parquet`,
    [RECORDS_BY_UNIT]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/records_by_unit.parquet`,
    [REFILLS_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/refills_distribution.parquet`,
    [VISIT_DETAIL_DURATION_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/visit_detail_duration_by_type.parquet`,
    [VISIT_DURATION_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/visit_duration_by_type.parquet`,
    [PREVALENCE_BY_GENDER_AGE_YEAR]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/prevalence_by_gender_age_year.parquet`,
    [AGE_AT_FIRST_DIAGNOSIS]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/age_at_first_diagnosis.parquet`,
    [CONDITIONS_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/conditions_by_type.parquet`,
    [AGE_AT_FIRST_OCCURRENCE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/age_at_first_occurrence.parquet`,
    [LOWER_LIMIT_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/lower_limit_distribution.parquet`,
    [MEASUREMENTS_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/measurements_by_type.parquet`,
    [RECORDS_PER_PERSON]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/records_per_person.parquet`,
    [UPPER_LIMIT_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/upper_limit_distribution.parquet`,
    [VALUES_RELATIVE_TO_NORM]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/values_relative_to_norm.parquet`,
    [AGE_AT_FIRST_EXPOSURE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/age_at_first_exposure.parquet`,
    [DRUGS_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/drugs_by_type.parquet`,
    [DEVICES_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/devices_by_type.parquet`,
    [PROCEDURES_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/procedures_by_type.parquet`,
    [OBSERVATIONS_BY_TYPE]: `${baseUrl}/data/${params.cdm}/${params.release}/concepts/observations_by_type.parquet`,
    [COHORT_INDEX]: `${baseUrl}/data/${params.cdm}/${params.release}/cohort_index.parquet`,
    [COHORT_CHARACTERIZATION]: `${baseUrl}/data/${params.cdm}/${params.release}/cohort_characterization.parquet`,
    [COHORT_INDEX_EVENT_BREAKDOWN]: `${baseUrl}/data/${params.cdm}/${params.release}/cohort_index_event_breakdown.parquet`,
    [COHORT_TEMPORAL_COVARIATE_DISTRIBUTION]: `${baseUrl}/data/${params.cdm}/${params.release}/cohort_temporal_covariate_distribution.parquet`,
  };
}

export default getFilePath;
