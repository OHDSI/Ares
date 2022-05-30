<template>
  <router-view name="DataSourcesExplorer" />
</template>

<script>
import { RESET_ERRORS } from "@/data/store/modules/errors/actions.type";
import { CLEAR_DATA } from "@/data/store/modules/view/mutations.type";
import getFilesByView from "@/configs/views/dataLoadConfig";

export default {
  name: "ReportsView",
  computed: {
    path: function () {
      return this.$route.path;
    },
  },
  watch: {
    path() {
      this.$store.dispatch(RESET_ERRORS);
      this.$store.dispatch(CLEAR_DATA);
      this.loadViewData();
    },
  },
  created() {
    this.$store.dispatch(RESET_ERRORS);
    this.$store.dispatch(CLEAR_DATA);
    this.loadViewData();
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
