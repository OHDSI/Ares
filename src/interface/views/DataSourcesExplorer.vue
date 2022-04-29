<template>
  <v-container fluid>
    <Explorer />
    <ErrorAlert />
    <router-view v-if="explorerLoaded" name="DataSourcesExplorer" />
  </v-container>
</template>

<script>
import Explorer from "../components/Explorer";
import ErrorAlert from "@/interface/components/CriticalError";
import { mapGetters } from "vuex";

export default {
  name: "DataSourcesExplorer",
  components: {
    ErrorAlert,
    Explorer
  },
  computed: {
    ...mapGetters(["explorerLoaded"])
  }
};
</script>

<style scoped></style>
