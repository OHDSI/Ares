import environment from "@/shared/api/environment";
import apiService from "@/shared/api/axios/apiService";

export const AnnotationsService = {
  search: {
    get(chart_ids: string[]) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/v1/annotations/search`,
          baseURL: "./",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            // Authorization: token ? `Bearer ${token}` : null,
          },
          data: {
            chart_ids,
          },
        },
        {}
      );
    },
  },
  fetchAll: {
    get(first: number, step: number, filter: string) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/v1/annotations/`,
          baseURL: "./",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            // Authorization: token ? `Bearer ${token}` : null,
          },
          data: {
            first,
            step,
            filter,
          },
        },
        {}
      );
    },
  },
  create: {
    post(
      id: string,
      chartId: string,
      chartName: string,
      reportName: string,
      domainName: string,
      conceptId: string,
      coordinates: any,
      metadata: any,
      body: any
    ) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/v1/annotations/new`,
          baseURL: "./",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            // Authorization: token ? `Bearer ${token}` : null,
          },
          data: {
            id,
            chartId,
            chartName,
            reportName,
            domainName,
            conceptId,
            coordinates,
            metadata,
            body,
          },
        },
        {}
      );
    },
  },
  delete: {
    delete(id: string) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/v1/annotations/${id}`,
          baseURL: "./",
          method: "delete",
          // headers: {
          //   "Content-Type": "application/json",
          //   // Authorization: token ? `Bearer ${token}` : null,
          // },
          // data: {
          //   id,
          // },
        },
        {}
      );
    },
  },
  edit: {
    put(id: string, coordinates: any, metadata: any, body: any) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/v1/annotations/${id}`,
          baseURL: "./",
          method: "put",
          headers: {
            "Content-Type": "application/json",
            // Authorization: token ? `Bearer ${token}` : null,
          },
          data: {
            coordinates,
            metadata,
            body,
          },
        },
        {}
      );
    },
  },
};
