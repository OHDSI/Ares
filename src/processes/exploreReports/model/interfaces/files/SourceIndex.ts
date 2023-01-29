export interface Source {
  average_update_interval_days: number;
  cdm_holder: string;
  cdm_source_abbreviation: string;
  cdm_source_key: string;
  cdm_source_name: string;
  count_releases: number;
  releases: SourceRelease[];
  source_description: string;
}

export interface SourceRelease {
  cdm_version: string;
  count_data_quality_checks: number;
  count_data_quality_issues: number;
  count_person: number;
  dqd_execution_date: string;
  dqd_version: string;
  obs_period_end: string;
  obs_period_start: string;
  release_id: string;
  release_name: string;
  vocabulary_version: string;
}
