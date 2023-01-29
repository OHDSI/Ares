export interface QueryIndexType {
  ACHILLES_PERFORMANCE: string[];
  CDM_SOURCE: string[];
  CONDITION_ERA: ConditionEraInterface;
  CONDITION_OCCURRENCE: ConditionOccurrenceInterface;
  DATA_DENSITY: DataDensityInterface;
  DEATH: DeathInterface;
  DEVICE_EXPOSURE: DeviceExposure;
  DOMAIN_SUMMARY: DomainSummary;
  DRUG_ERA: DrugEra;
  DRUG_EXPOSURE: DRUG_EXPOSURE;
  MEASUREMENT: MEASUREMENT;
  METADATA: string[];
  OBSERVATION: OBSERVATION;
  OBSERVATION_PERIOD: OBSERVATION_PERIOD;
  PERSON: PERSON;
  PROCEDURE_OCCURRENCE: PROCEDURE_OCCURRENCE;
  QUALITY_COMPLETENESS: string[];
  VISIT_DETAIL: VISIT_DETAIL;
  VISIT_OCCURRENCE: VISIT_OCCURRENCE;
}

interface ConditionEraInterface {
  AGE_AT_FIRST_EXPOSURE: string[];
  LENGTH_OF_ERA: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
}
interface ConditionOccurrenceInterface {
  AGE_AT_FIRST_DIAGNOSIS: string[];
  CONDITIONS_BY_TYPE: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
}

interface DataDensityInterface {
  DATADENSITY_CONCEPTS_PER_PERSON: string[];
  DATADENSITY_DOMAINS_PER_PERSON: string[];
  DATADENSITY_RECORDS_PER_PERSON: string[];
  DATADENSITY_TOTAL: string[];
}

interface DeathInterface {
  AGE_AT_DEATH: string[];
  DEATH_BY_TYPE: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
}

interface DeviceExposure {
  AGE_AT_FIRST_EXPOSURE: string[];
  DEVICES_BY_TYPE: string[];
  DEVICE_FREQUENCY_DISTRIBUTION: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
}

interface DomainSummary {
  CONDITION_ERA: string[];
  CONDITION_OCCURRENCE: string[];
  DEVICE_EXPOSURE: string[];
  DOMAIN_DRUG_STRATIFICATION: string[];
  DOMAIN_VISIT_STRATIFICATION: string[];
  DRUG_ERA: string[];
  DRUG_EXPOSURE: string[];
  MEASUREMENT: string[];
  OBSERVATION: string[];
  PROCEDURE_OCCURRENCE: string[];
  PROVIDER: string[];
  RECORDS_BY_DOMAIN: string[];
  VISIT_DETAIL: string[];
  VISIT_OCCURRENCE: string[];
}

interface DrugEra {
  AGE_AT_FIRST_EXPOSURE: string[];
  LENGTH_OF_ERA: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
}

interface DRUG_EXPOSURE {
  AGE_AT_FIRST_EXPOSURE: string[];
  DAYS_SUPPLY_DISTRIBUTION: string[];
  DRUGS_BY_TYPE: string[];
  DRUG_FREQUENCY_DISTRIBUTION: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  QUANTITY_DISTRIBUTION: string[];
  REFILLS_DISTRIBUTION: string[];
  SUMMARY: string[];
}
interface MEASUREMENT {
  AGE_AT_FIRST_OCCURRENCE: string[];
  FREQUENCY_DISTRIBUTION: string[];
  LOWER_LIMIT_DISTRIBUTION: string[];
  MEASUREMENTS_BY_TYPE: string[];
  MEASUREMENT_VALUE_DISTRIBUTION: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  RECORDS_BY_UNIT: string[];
  SUMMARY: string[];
  UPPER_LIMIT_DISTRIBUTION: string[];
  VALUES_RELATIVE_TO_NORM: string[];
}

interface OBSERVATION {
  AGE_AT_FIRST_OCCURRENCE: string[];
  OBSERVATIONS_BY_TYPE: string[];
  OBS_FREQUENCY_DISTRIBUTION: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
}
interface OBSERVATION_PERIOD {
  AGE_AT_FIRST_OBSERVATION: string[];
  AGE_BY_GENDER: string[];
  CUMULATIVE_DURATION: string[];
  OBSERVATION_LENGTH_HISTOGRAM: string[];
  OBSERVATION_PERIOD_LENGTH_BY_AGE: string[];
  OBSERVATION_PERIOD_LENGTH_BY_GENDER: string[];
  OBSERVED_BY_MONTH: string[];
  OBSERVED_BY_YEAR_HISTOGRAM: string[];
  PERSON_PERIODS_DATA: string[];
}
interface PERSON {
  AGE_GENDER_DATA: string[];
  BIRTH_YEAR_DATA: string[];
  ETHNICITY_DATA: string[];
  GENDER_DATA: string[];
  RACE_DATA: string[];
  SUMMARY: string[];
}
interface PROCEDURE_OCCURRENCE {
  AGE_AT_FIRST_OCCURRENCE: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  PROCEDURES_BY_TYPE: string[];
  PROCEDURE_FREQUENCY_DISTRIBUTION: string[];
  SUMMARY: string[];
}

interface VISIT_DETAIL {
  AGE_AT_FIRST_OCCURRENCE: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
  VISIT_DETAIL_DURATION_BY_TYPE: string[];
}
interface VISIT_OCCURRENCE {
  AGE_AT_FIRST_OCCURRENCE: string[];
  PREVALENCE_BY_GENDER_AGE_YEAR: string[];
  PREVALENCE_BY_MONTH: string[];
  SUMMARY: string[];
  VISIT_DURATION_BY_TYPE: string[];
}
