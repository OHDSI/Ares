import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";

export interface PersonData {
  AGE_GENDER_DATA: AGE_GENDER_DATA[];
  BIRTH_YEAR_DATA: BIRTH_YEAR[];
  ETHNICITY_DATA: RecordsCountType[];
  GENDER_DATA: RecordsCountType[];
  RACE_DATA: RecordsCountType[];
  SUMMARY: SUMMARY[];
}

export interface AGE_GENDER_DATA {
  AGE: number;
  CONCEPT_ID: number;
  CONCEPT_NAME: string;
  COUNT_VALUE: number;
}

export interface BIRTH_YEAR {
  COUNT_PERSON: number;
  YEAR: string | Date;
}

export interface SUMMARY {
  ATTRIBUTE_NAME: string;
  ATTRIBUTE_VALUE: string;
}
