<template>
  <div v-if="explorerLoaded" id="explorer" class="pa-2">
    <v-row>
      <v-col cols="1">
        <v-btn to="/home" icon large class="mb-8">
          <v-img
            class="inverted"
            :src="require('../../../shared/assets/icon.png')"
            max-height="32"
            max-width="32"
          ></v-img></v-btn
      ></v-col>
      <v-col cols="auto">
        <v-autocomplete
          :value="getSelectedFolder"
          class="mt-4"
          label="Report Category"
          return-object
          prepend-icon="mdi-folder"
          auto-select-first
          dense
          :items="folders"
          item-text="name"
          item-value="name"
          @input="changeFolder"
        >
          <template v-slot:item="{ item }">
            <v-icon left small>{{ item.icon }}</v-icon> {{ item.name }}
          </template>
        </v-autocomplete>
      </v-col>
      <v-col v-if="showSourceSelector" cols="auto">
        <v-autocomplete
          class="mt-4"
          label="Data Source"
          :value="getSelectedSource"
          return-object
          prepend-icon="mdi-database"
          auto-select-first
          dense
          :items="getSources"
          item-text="cdm_source_abbreviation"
          item-value="cdm_source_key"
          @input="changeSource"
        ></v-autocomplete>
      </v-col>
      <v-col v-if="showReleaseSelector" cols="auto">
        <v-autocomplete
          class="mt-4"
          label="Data Source Release"
          :value="getSelectedRelease"
          return-object
          prepend-icon="mdi-database-clock"
          auto-select-first
          dense
          :items="getReleases"
          item-text="release_name"
          item-value="release_id"
          @input="changeRelease"
        ></v-autocomplete>
      </v-col>
      <v-col cols="auto">
        <v-autocomplete
          class="mt-4"
          label="Report"
          :value="getSelectedReport"
          return-object
          prepend-icon="mdi-file-chart"
          auto-select-first
          dense
          :items="getFilteredReports"
          item-text="name"
          item-value="route"
          @input="changeReport"
        >
          <template v-slot:item="{ item }">
            <v-icon left small>{{ item.icon }}</v-icon> {{ item.name }}
          </template>
        </v-autocomplete>
      </v-col>
      <v-col v-if="showConceptSelector" cols="auto">
        <v-text-field
          readonly
          class="mt-4"
          label="Concept ID"
          return-object
          prepend-icon="mdi-chart-timeline-variant-shimmer"
          dense
          :value="showConceptSelector"
        ></v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  FETCH_INDEX,
  FETCH_QUERY_INDEX,
} from "@/widgets/explorer/model/store/actions.type";
import config from "@/widgets/explorer/config";

export default {
  name: "Explorer",
  data() {
    return {
      folders: config.folders,
      reports: config.reports,
    };
  },

  computed: {
    ...mapGetters([
      "getSources",
      "getSelectedFolder",
      "getReleases",
      "explorerLoaded",
      "getFilteredReports",
      "getSelectedRelease",
      "getSelectedSource",
      "getSelectedReport",
    ]),
    showConceptSelector: function () {
      return this.$route.params.concept;
    },
    showSourceSelector: function () {
      return (
        this.getSelectedFolder.key === "datasource" ||
        this.getSelectedFolder.key === "cdm"
      );
    },
    showReleaseSelector: function () {
      return this.getSelectedFolder.key === "cdm";
    },
  },
  methods: {
    changeSource(data) {
      this.$router.push({
        params: {
          ...this.$route.params,
          cdm: data.cdm_source_key,
          release: data.releases[0].release_id,
        },
      });
    },
    changeRelease(data) {
      this.$router.push({
        params: {
          ...this.$route.params,
          release: data.release_id,
        },
      });
    },
    changeFolder(data) {
      this.$router.push({
        name: data.key,
        params: {
          cdm: this.getSelectedSource
            ? this.getSelectedSource.cdm_source_key
            : this.getSources[0].cdm_source_key,
          release: this.getSelectedSource
            ? this.getSelectedRelease.release_id
            : this.getSources[0].releases[0].release_id,
        },
      });
    },
    changeReport(data) {
      this.$router.push({
        name: data.routeName,
        params: {
          ...this.$route.params,
          domain: data.domain,
          concept: "",
        },
      });
    },
  },
};
</script>

<style scoped>
tr:hover {
  background-color: transparent !important;
}
.v-input {
  font-size: 14px;
}
.inverted {
  filter: invert(0.5);
}
</style>
