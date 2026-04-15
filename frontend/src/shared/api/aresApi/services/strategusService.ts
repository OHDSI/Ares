import environment from "@/shared/api/environment";
import apiService from "@/shared/api/axios/apiService";

let _currentSchema: string | undefined;

export function setStrategusSchema(schema: string | undefined): void {
  _currentSchema = schema;
}

export const StrategusService = {
  characterization: {
    getTargetTable() {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/target-table`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: { schema: _currentSchema },
        },
        {}
      );
    },
    getOutcomeTable(targetId: number) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/outcome-table`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            targetId,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getCohortBinary(
      targetIds: number[],
      databaseIds?: string[],
      minThreshold = 0
    ) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/cohort-binary`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            targetIds: targetIds.join(","),
            databaseIds: databaseIds ? databaseIds.join(",") : undefined,
            minThreshold,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getCohortContinuous(
      targetIds: number[],
      databaseIds?: string[],
      minThreshold = 0
    ) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/cohort-continuous`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            targetIds: targetIds.join(","),
            databaseIds: databaseIds ? databaseIds.join(",") : undefined,
            minThreshold,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getDechallengeRechallenge(targetIds?: number[], outcomeIds?: number[]) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/dechallenge-rechallenge`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            targetIds: targetIds ? targetIds.join(",") : undefined,
            outcomeIds: outcomeIds ? outcomeIds.join(",") : undefined,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getDechallengeRechallengeFails(
      targetId: number,
      outcomeId: number,
      databaseId: string,
      dechallengeStopInterval?: number,
      dechallengeEvaluationWindow?: number
    ) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/dechallenge-rechallenge-fails`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            targetId,
            outcomeId,
            databaseId,
            dechallengeStopInterval,
            dechallengeEvaluationWindow,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getCohortUniquePeople(cohortId: number) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/cohort-unique-people`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            cohortId,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getCaseCounts(params: {
      targetIds?: number[];
      outcomeIds?: number[];
      databaseIds?: string[];
      riskWindowStart?: number;
      riskWindowEnd?: number;
      startAnchor?: string;
      endAnchor?: string;
    }) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/case-counts`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: {
            targetIds: params.targetIds?.join(","),
            outcomeIds: params.outcomeIds?.join(","),
            databaseIds: params.databaseIds?.join(","),
            riskWindowStart: params.riskWindowStart,
            riskWindowEnd: params.riskWindowEnd,
            startAnchor: params.startAnchor,
            endAnchor: params.endAnchor,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getCaseTargetCounts(params: {
      targetIds?: number[];
      outcomeIds?: number[];
      databaseIds?: string[];
    }) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/case-target-counts`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: {
            targetIds: params.targetIds?.join(","),
            outcomeIds: params.outcomeIds?.join(","),
            databaseIds: params.databaseIds?.join(","),
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getBinaryRiskFactors(params: {
      targetId: number;
      outcomeId: number;
      databaseId?: string;
      riskWindowStart?: number;
      riskWindowEnd?: number;
      startAnchor?: string;
      endAnchor?: string;
    }) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/binary-risk-factors`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { ...params, schema: _currentSchema },
        },
        {}
      );
    },
    getContinuousRiskFactors(params: {
      targetId: number;
      outcomeId: number;
      databaseId?: string;
      riskWindowStart?: number;
      riskWindowEnd?: number;
      startAnchor?: string;
      endAnchor?: string;
    }) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/continuous-risk-factors`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { ...params, schema: _currentSchema },
        },
        {}
      );
    },
    getTimeToEvent(targetIds?: number[], outcomeIds?: number[]) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/time-to-event`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: {
            targetIds: targetIds ? targetIds.join(",") : undefined,
            outcomeIds: outcomeIds ? outcomeIds.join(",") : undefined,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getBinaryCaseSeries(params: {
      targetId: number;
      outcomeId: number;
      databaseId?: string;
      riskWindowStart?: number;
      riskWindowEnd?: number;
      startAnchor?: string;
      endAnchor?: string;
    }) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/binary-case-series`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { ...params, schema: _currentSchema },
        },
        {}
      );
    },
    getContinuousCaseSeries(params: {
      targetId: number;
      outcomeId: number;
      databaseId?: string;
      riskWindowStart?: number;
      riskWindowEnd?: number;
      startAnchor?: string;
      endAnchor?: string;
    }) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/continuous-case-series`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { ...params, schema: _currentSchema },
        },
        {}
      );
    },
    getIncidenceRates(targetIds?: number[], outcomeIds?: number[]) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/incidence-rates`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: {
            targetIds: targetIds ? targetIds.join(",") : undefined,
            outcomeIds: outcomeIds ? outcomeIds.join(",") : undefined,
            schema: _currentSchema,
          },
        },
        {}
      );
    },
    getOutcomeDataAvailability(targetId: number, outcomeIds: number[]) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/characterization/outcome-data-availability`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: {
            targetId,
            outcomeIds: outcomeIds.join(","),
            schema: _currentSchema,
          },
        },
        {}
      );
    },
  },
  debug: {
    getRunningQueries() {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/debug/running-queries`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
        },
        {}
      );
    },
    triggerSlowQuery(secs = 30) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/debug/slow-query`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { secs },
        },
        {}
      );
    },
    getQueryHistory(cursor = 0) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/debug/query-history`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { cursor },
        },
        {}
      );
    },
    clearQueryHistory() {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/debug/query-history`,
          baseURL: "./",
          method: "delete",
          headers: { "Content-Type": "application/json" },
        },
        {}
      );
    },
    getLogs(cursor?: number) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/debug/logs`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: cursor != null ? { cursor } : {},
        },
        {}
      );
    },
    clearLogs() {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/debug/logs`,
          baseURL: "./",
          method: "delete",
          headers: { "Content-Type": "application/json" },
        },
        {}
      );
    },
  },
  dataSources: {
    getDataSources() {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/datasources`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
          params: { schema: _currentSchema },
        },
        {}
      );
    },
  },
  dbList: {
    getDbList() {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/db-list`,
          baseURL: "./",
          method: "get",
          headers: { "Content-Type": "application/json" },
        },
        {}
      );
    },
  },
};
