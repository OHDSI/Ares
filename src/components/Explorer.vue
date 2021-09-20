<template>
  <div id="explorer" class="pa-2">
    <v-row>
      <v-col cols="1">
        <v-btn to="/home" icon large class="mb-8">
          <v-img
            class="inverted"
            :src="require('../assets/icon.png')"
            max-height="32"
            max-width="32"
          ></v-img></v-btn
      ></v-col>
      <v-col cols="auto">
        <v-autocomplete
          class="mt-4"
          label="Report Category"
          v-model="selectedFolder"
          return-object
          prepend-icon="mdi-folder"
          auto-select-first
          dense
          :items="folders"
          item-text="name"
          item-value="name"
          v-on:change="changeFolder"
        >
          <template v-slot:item="{ item }">
            <v-icon left small>{{ item.icon }}</v-icon> {{ item.name }}
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="auto" v-if="showSourceSelector">
        <v-autocomplete
          class="mt-4"
          label="Data Source"
          v-model="selectedSource"
          return-object
          prepend-icon="mdi-database"
          auto-select-first
          dense
          :items="sources"
          item-text="cdm_source_abbreviation"
          item-value="cdm_source_key"
          v-on:change="changeSource"
        ></v-autocomplete>
      </v-col>
      <v-col cols="auto" v-if="showReleaseSelector">
        <v-autocomplete
          class="mt-4"
          label="Data Source Release"
          v-model="selectedRelease"
          return-object
          prepend-icon="mdi-database-clock"
          auto-select-first
          dense
          :items="releases"
          item-text="release_name"
          item-value="release_id"
          v-on:change="changeReport"
        ></v-autocomplete>
      </v-col>
      <v-col cols="auto">
        <v-autocomplete
          class="mt-4"
          label="Report"
          v-model="selectedReport"
          return-object
          prepend-icon="mdi-file-chart"
          auto-select-first
          dense
          :items="filteredReports"
          item-text="name"
          item-value="route"
          v-on:change="changeReport"
        >
          <template v-slot:item="{ item }">
            <v-icon left small>{{ item.icon }}</v-icon> {{ item.name }}
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      selectedSource: null,
      selectedReport: null,
      selectedRelease: null,
      selectedFolder: null,
      networkIndex: [],
      folders: [
        {
          icon: "mdi-network",
          name: "Data Network",
          key: "_network",
        },
        {
          icon: "mdi-database",
          name: "Data Source",
          key: "_datasource",
        },
        {
          icon: "mdi-database-clock",
          name: "Data Source Release",
          key: "_cdm",
        },
        /*
        {
          icon: "mdi-bug",
          name: "System Diagnostics",
          route: "/_system",
        },

        */
      ],
      sources: [],
      releases: [],
      filteredReports: [],
      reports: [
        {
          folder: "Data Source Release",
          icon: "mdi-sigma-lower",
          name: "Data Quality",
          route: "/_cdm/:selectedSource/:selectedRelease/quality",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Person",
          route: "/_cdm/:selectedSource/:selectedRelease/person",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Data Density",
          route: "/_cdm/:selectedSource/:selectedRelease/density",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Observation Period",
          route: "/_cdm/:selectedSource/:selectedRelease/observationperiod",
        },
        {
          folder: "Data Source",
          name: "Data Quality History",
          route: "/_datasource/:selectedSource/quality-history",
        },
        {
          folder: "Data Source",
          name: "Domain Continuity",
          route: "/_datasource/:selectedSource/domain-continuity",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Conditions",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/condition_occurrence/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Condition Eras",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/condition_era/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Drugs",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/drug_exposure/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Drug Eras",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/drug_era/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Visit Occurrence",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/visit_occurrence/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Visit Detail",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/visit_detail/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Measurements",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/measurement/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Observations",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/observation/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Procedures",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/procedure_occurrence/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Device Exposures",
          route:
            "/_cdm/:selectedSource/:selectedRelease/domain/device_exposure/summary",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Death",
          route: "/_cdm/:selectedSource/:selectedRelease/death",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Unmapped Source Codes",
          route: "/_cdm/:selectedSource/:selectedRelease/unmapped",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-speedometer",
          name: "Performance",
          route: "/_cdm/:selectedSource/:selectedRelease/performance",
        },
        {
          folder: "Data Source Release",
          icon: "mdi-alpha-m-circle-outline",
          name: "Metadata",
          route: "/_cdm/:selectedSource/:selectedRelease/metadata",
        },
        {
          folder: "Data Network",
          icon: "mdi-table",
          name: "Overview",
          route: "/_network/overview",
        },
        {
          folder: "Data Network",
          icon: "mdi-sigma-lower",
          name: "Quality Assessment",
          route: "/_network/dataquality",
        },
        {
          folder: "Data Network",
          icon: "mdi-chart-line",
          name: "Population Overview",
          route: "/_network/population",
        },
        {
          folder: "Data Network",
          icon: "mdi-dna",
          name: "Data Strand Report",
          route: "/_network/datastrand",
        },
      ],
    };
  },
  watch: {
    $route() {},
  },
  created() {
    var self = this;
    axios
      .get("data/index.json")
      .then((response) => {
        self.networkIndex = response.data.dataQualityRecords;
        self.sources = response.data.sources;
        self.updateSelectors();
      })
      .catch((err) => {
        console.log("explorer failed to load network index");
        console.log(err);
      });
  },
  computed: {
    showSourceSelector: function () {
      if (
        this.selectedFolder &&
        (this.selectedFolder.key == "_datasource" ||
          this.selectedFolder.key == "_cdm")
      ) {
        return true;
      }
      return false;
    },
    showReleaseSelector: function () {
      if (this.selectedFolder && this.selectedFolder.key == "_cdm") {
        return true;
      }
      return false;
    },
  },
  methods: {
    updateSelectors() {
      var self = this;
      var selectedSourceIndex = 0;
      var selectedReleaseIndex = 0;
      var selectedFolderIndex = 0;

      for (i = 0; i < self.folders.length; i++) {
        if (self.$route.path.includes(self.folders[i].key)) {
          selectedFolderIndex = i;
        }
      }
      self.selectedFolder = self.folders[selectedFolderIndex];

      this.filteredReports = this.reports.filter(
        (report) => report.folder == this.selectedFolder.name
      );

      for (i = 0; i < self.sources.length; i++) {
        if (self.$route.path.includes(self.sources[i].cdm_source_key)) {
          selectedSourceIndex = i;
        }
      }

      self.selectedSource = self.sources[selectedSourceIndex];
      self.releases = self.selectedSource.releases;

      for (i = 0; i < self.releases.length; i++) {
        if (self.$route.path.includes(self.releases[i].release_id)) {
          selectedReleaseIndex = i;
        }
      }

      self.selectedRelease = self.releases[selectedReleaseIndex];

      var placeholder = /:[\w]+/g;
      var selectedReportIndex = null;
      var path = self.$route.path;
      for (var i = 0; i < self.filteredReports.length; i++) {
        var routeCheck = self.filteredReports[i].route
          .replace(placeholder, "[\\w]+")
          .replaceAll("/", "\\/");
        var routeRegExp = new RegExp(routeCheck);
        if ((path.match(routeRegExp) || []).length > 0) {
          selectedReportIndex = i;
          break;
        }
      }
      self.selectedReport = self.filteredReports[selectedReportIndex];
    },
    changeSource() {
      this.releases = this.selectedSource.releases;
      this.selectedRelease = this.releases[0];
      this.changeReport();
    },
    changeFolder() {
      this.filteredReports = this.reports.filter(
        (report) => report.folder == this.selectedFolder.name
      );
    },
    changeReport() {
      if (this.selectedSource != null && this.selectedReport != null) {
        var route = this.selectedReport.route;
        route = route.replace(
          ":selectedSource",
          this.selectedSource.cdm_source_key
        );
        route = route.replace(
          ":selectedRelease",
          this.selectedRelease.release_id
        );

        this.$router.push({
          path: route,
        });
      }
    },
  },
  name: "explorer",
  props: {},
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
