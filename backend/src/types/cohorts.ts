export interface CohortCount {
  cohortId: number;
  cohortName: string;
  cohortEntries: number;
  cohortSubjects: number;
  databaseName: string;
  databaseId: string;
}

export interface CohortGeneration {
  cohortId: number;
  cohortName: string;
  generated: boolean;
  startTime: string;
  endTime: string;
  databaseName: string;
  databaseId: string;
}

export interface CohortDefinition {
  cohortDefinitionId: number;
  cohortName: string;
  sqlCommand: string;
  sql: string;
  subsetDefinitionId: number | null;
  subsetDefinitionJson: string | null;
  subsetParent: number | null;
  json?: string | null;
}

export interface CohortInclusionRule {
  cohortDefinitionId: number;
  cohortName: string;
  ruleSequence: number;
  ruleName: string;
}

export interface CohortInclusionStats {
  databaseId: string;
  databaseName: string;
  cohortDefinitionId: number;
  cohortName: string;
  inclusionRuleMask: string;
  personCount: number;
  modeId: number;
}

export interface CohortUniquePeopleRow {
  databaseId: string;
  cohortId: number;
  cohortEntries: number;
  cohortSubjects: number;
}
