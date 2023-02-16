import webApiStore from "@/shared/api/webAPI/data/store/webApi.module";
import authStore from "@/shared/api/webAPI/authentication/model/store/auth.module";
import * as authActions from "./authentication/model/store/actions.type";
import * as webApiActions from "./data/store/actions.type";

export { webApiStore, webApiActions, authStore, authActions };
