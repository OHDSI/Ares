import environment from "@/shared/api/environment";
import apiService from "@/shared/api/axios/apiService";

export const AnnotationsService = {
  search: {
    get(viz_names: string[]) {
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
            viz_names: viz_names,
          },
        },
        {}
      );
    },
  },
  create: {
    post(
      id: string,
      vizName: string,
      coordinates: any,
      metadata: any,
      body: any
    ) {
      return apiService(
        {
          url: `${environment.ARES_API_URL}/api/v1/annotations`,
          baseURL: "./",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            // Authorization: token ? `Bearer ${token}` : null,
          },
          data: {
            id,
            vizName,
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
