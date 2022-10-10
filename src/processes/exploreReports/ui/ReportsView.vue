<template>
  <v-container fluid>
    <Explorer v-if="showExplorer" />
    <Error v-if="getErrors" />
    <router-view v-if="!getErrors" name="reportsView" />
    <Settings />
    <BottomNav />
  </v-container>
</template>

<script>
import { Error } from "@/widgets/error";
import { Explorer, explorerActions } from "@/widgets/explorer";
import { Settings } from "@/widgets/settings";
import BottomNav from "@/widgets/bottomNav";

import { RESET_DATA_STORAGE } from "../model/store/actions.type";
import getFilesByView from "../config/dataLoadConfig";

import { mapGetters } from "vuex";

export default {
  name: "ReportsView",
  components: { BottomNav, Explorer, Error, Settings },
  computed: {
    ...mapGetters(["explorerLoaded", "getSources", "getErrors"]),
    path: function () {
      return this.$route.path;
    },
    showExplorer: function () {
      return (
        this.path.includes("network") ||
        this.path.includes("cdm") ||
        this.path.includes("datasource")
      );
    },
  },
  watch: {
    path() {
      this.$store.dispatch(RESET_DATA_STORAGE);
      this.loadViewData();
    },
  },
  created() {
    this.$store.dispatch(explorerActions.FETCH_QUERY_INDEX, {
      route: this.$route.params,
    });
    this.$store
      .dispatch(explorerActions.FETCH_INDEX, { route: this.$route.params })
      .then(() => this.loadViewData());
  },

  methods: {
    loadViewData: function () {
      const view = getFilesByView()[this.$route.name];
      if (view) {
        this.$store.dispatch(view.loadMethod, view.payload);
      }
    },
  },
};
</script>

<style scoped></style>
