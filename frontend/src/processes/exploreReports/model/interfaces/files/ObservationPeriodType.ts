import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { DurationType } from "@/processes/exploreReports/model/interfaces/reportTypes/DurationType";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { HistogramType } from "@/processes/exploreReports/model/interfaces/reportTypes/HistogramType";

export interface ObservationPeriodType {
  AGE_AT_FIRST_OBSERVATION: AGE_AT_FIRST_OBSERVATION[];
  AGE_BY_GENDER: DistributionType[];
  CUMULATIVE_DURATION: DurationType[];
  OBSERVATION_LENGTH_HISTOGRAM: HistogramType;
  OBSERVATION_PERIOD_LENGTH_BY_AGE: DistributionType[];
  OBSERVATION_PERIOD_LENGTH_BY_GENDER: DistributionType[];
  OBSERVED_BY_MONTH: OBSERVED_BY_MONTH[];
  OBSERVED_BY_YEAR_HISTOGRAM: HistogramType;
  PERSON_PERIODS_DATA: RecordsCountType[];
}

export interface AGE_AT_FIRST_OBSERVATION {
  COUNT_VALUE: number;
  INTERVAL_INDEX: number;
  PERCENT_VALUE: number;
}

export interface OBSERVED_BY_MONTH {
  COUNT_VALUE: string;
  DATE: Date;
  MONTH_YEAR: string;
  PERCENT_VALUE: number;
}
