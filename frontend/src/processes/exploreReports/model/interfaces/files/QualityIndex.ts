export interface QualityIndex {
  dataQualityRecords: DataQualityRecord[];
  dataQualityRecordsStratified: DataQualityRecordStratified[];
}

export interface DataQualityRecord {
  cdm_release_date: string;
  cdm_source_abbreviation: string;
  cdm_source_name: string;
  count_failed: number;
  count_passed: number;
  count_total: number;
  dqd_execution_date: string;
  vocabulary_version: string;
}

export interface DataQualityRecordStratified {
  category: string;
  cdm_release_date: string;
  cdm_table_name: string;
  count_value: number;
  dqd_execution_date: string;
}
