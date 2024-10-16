import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { FrequencyDistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/FrequencyDistributionType";
import { PrevalenceType } from "@/processes/exploreReports/model/interfaces/reportTypes/PrevalenceType";

export interface ConceptType {
  CDM_TABLE_NAME: string[];
  AGE_AT_FIRST_DIAGNOSIS?: DistributionType[];
  CONCEPT_ID: number[] | number;
  CONCEPT_NAME: string[];
  NUM_PERSONS: number[];
  PERCENT_PERSONS: string[];
  RECORDS_PER_PERSON: string[];
  CONDITIONS_BY_TYPE: RecordsCountType[];
  PREVALENCE_BY_GENDER_AGE_YEAR: PrevalenceType[];
  PREVALENCE_BY_MONTH: PrevalenceType[];
  COUNT_FAILED?: string[];
  IS_STATIONARY: string[];
  SEASONALITY_SCORE: string[];
  AGE_AT_FIRST_OCCURRENCE?: DistributionType[];
  FREQUENCY_DISTRIBUTION?: FrequencyDistributionType[];
  LOWER_LIMIT_DISTRIBUTION?: string[];
  MEASUREMENTS_BY_TYPE?: RecordsCountType;
  MEASUREMENT_VALUE_DISTRIBUTION?: DistributionType[];
  RECORDS_BY_UNIT?: RecordsCountType[];
  UPPER_LIMIT_DISTRIBUTION?: string[];
  VALUES_RELATIVE_TO_NORM?: string[];
  REFILLS_DISTRIBUTION?: DistributionType[];
  QUANTITY_DISTRIBUTION?: DistributionType[];
  DAYS_SUPPLY_DISTRIBUTION?: DistributionType[];
  DRUGS_BY_TYPE?: RecordsCountType[];
  DRUG_FREQUENCY_DISTRIBUTION?: FrequencyDistributionType[];
  VISIT_DURATION_BY_TYPE?: DistributionType[];
  VISIT_DETAIL_DURATION_BY_TYPE?: DistributionType[];
  OBS_FREQUENCY_DISTRIBUTION?: FrequencyDistributionType[];
  OBSERVATIONS_BY_TYPE?: RecordsCountType[];
  PROCEDURE_FREQUENCY_DISTRIBUTION?: FrequencyDistributionType[];
  PROCEDURES_BY_TYPE?: RecordsCountType[];
  DEVICE_FREQUENCY_DISTRIBUTION?: FrequencyDistributionType[];
  DEVICES_BY_TYPE?: RecordsCountType[];
  LENGTH_OF_ERA?: DistributionType[];
}
