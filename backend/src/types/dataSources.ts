export interface DataSource {
  databaseId: string;
  cdmSourceName: string;
  cdmSourceAbbreviation: string;
  cdmHolder: string | null;
  sourceDescription: string | null;
  sourceDocumentationReference: string | null;
  cdmEtlReference: string | null;
  sourceReleaseDate: string | null;
  cdmReleaseDate: string | null;
  cdmVersion: string | null;
  cdmVersionConceptId: number | null;
  vocabularyVersion: string | null;
  maxObsPeriodEndDate: string | null;
}

export interface DbListEntry {
  dbName: string;
  schemaName: string;
  releaseDate: string;
}
