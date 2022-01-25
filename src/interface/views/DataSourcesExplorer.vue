<template>
  <div>
    <Explorer />
    <ErrorAlert />
    <div v-if="explorerLoaded">
      <router-view name="DataSourcesExplorer" />
    </div>
  </div>
</template>

<script>
import Explorer from "../components/Explorer";
import ErrorAlert from "@/interface/components/ErrorAlert";
import { mapGetters } from "vuex";

export default {
  name: "DataSourcesExplorer",
  components: {
    ErrorAlert,
    Explorer,
  },
  computed: {
    ...mapGetters(["explorerLoaded"]),
  },
};
</script>

<style scoped></style>
