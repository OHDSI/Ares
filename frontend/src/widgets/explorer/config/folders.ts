import {
  mdiDatabaseClockOutline,
  mdiDatabaseOutline,
  mdiNetworkOutline,
} from "@mdi/js";

export const folders = [
  {
    icon: mdiNetworkOutline,
    name: "Data Network",
    key: "network",
  },
  {
    icon: mdiDatabaseOutline,
    name: "Data Source",
    key: "datasource",
  },
  {
    icon: mdiDatabaseClockOutline,
    name: "Data Source Release",
    key: "cdm",
  },
];
