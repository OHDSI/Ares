import environment from "@/shared/api/environment";

export const getAuthConfig = function () {
  return {
    auth: {
      clientId: environment.AZURE_CLIENT_ID,
      authority: environment.AZURE_AUTH_DOMAIN,
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };
};
