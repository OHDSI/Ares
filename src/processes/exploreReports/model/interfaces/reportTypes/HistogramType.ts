export interface HistogramType {
  DATA?: Data[];
  INTERVALS: number[];
  INTERVAL_SIZE: number[];
  MAX: number[];
  MIN: number[];
}

interface Data {
  COUNT_VALUE: number;
  INTERVAL_INDEX: number;
  PERCENT_VALUE: number;
}
