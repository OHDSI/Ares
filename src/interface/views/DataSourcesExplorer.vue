<template>
  <v-container fluid>
    <Explorer />
    <ErrorAlert />
    <ReportsView v-if="explorerLoaded" />
  </v-container>
</template>

<script>
import Explorer from "../components/Explorer";
import ErrorAlert from "@/interface/components/CriticalError";
import { mapGetters } from "vuex";
import ReportsView from "@/interface/views/ReportsView";

export default {
  name: "DataSourcesExplorer",
  components: {
    ReportsView,
    ErrorAlert,
    Explorer,
  },
  computed: {
    ...mapGetters(["explorerLoaded", "getSources"]),
  },
};
</script>

<style scoped></style>
