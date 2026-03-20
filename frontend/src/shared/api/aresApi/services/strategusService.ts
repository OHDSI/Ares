import environment from "@/shared/api/environment";
import apiService from "@/shared/api/axios/apiService";

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
          params,
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
          params,
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
          params,
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
          params,
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
          },
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
        },
        {}
      );
    },
  },
};
