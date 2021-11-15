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
          @input="changeFolder"
          :value="getFolder"
          return-object
          prepend-icon="mdi-folder"
          auto-select-first
          dense
          :items="folders"
          item-text="name"
          item-value="name"
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
          @input="changeSource"
          :value="getSource"
          return-object
          prepend-icon="mdi-database"
          auto-select-first
          dense
          :items="sources"
          item-text="cdm_source_abbreviation"
          item-value="cdm_source_key"
        ></v-autocomplete>
      </v-col>
      <v-col cols="auto" v-if="showReleaseSelector">
        <v-autocomplete
          class="mt-4"
          label="Data Source Release"
          @input="changeRelease"
          :value="getSelectedRelease"
          return-object
          prepend-icon="mdi-database-clock"
          auto-select-first
          dense
          :items="getReleases"
          item-text="release_name"
          item-value="release_id"
        ></v-autocomplete>
      </v-col>
      <v-col cols="auto">
        <v-autocomplete
          class="mt-4"
          label="Report"
          @input="changeReport"
          :value="getSelectedReport"
          return-object
          prepend-icon="mdi-file-chart"
          auto-select-first
          dense
          :items="getFilteredReports"
          item-text="name"
          item-value="route"
        >
          <template v-slot:item="{ item }">
            <v-icon left small>{{ item.icon }}</v-icon> {{ item.name }}
          </template>
        </v-autocomplete>
      </v-col>
        <v-col cols="auto" v-if="showConceptSelector">
          <v-text-field
              disabled
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
import axios from "axios";

export default {
  data() {
    return {
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
      filteredReports: [],
      reports: [
        {
          folder: "Data Source Release",
          icon: "mdi-sigma-lower",
          name: "Data Quality",
          routeName: "data_quality"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Person",
          routeName: "person"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Data Density",
          routeName: "data_density"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Observation Period",
          routeName: "observation_period"
        },
        {
          folder: "Data Source",
          name: "Data Quality History",
          routeName: "data_quality_history"
        },
        {
          folder: "Data Source",
          name: "Domain Continuity",
          routeName: "domain_continuity"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Conditions",
          routeName: "domain_table",
          domain: "condition_occurrence"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Condition Eras",
          routeName: "domain_table",
          domain: "condition_era"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Drugs",
          routeName: "domain_table",
          domain: "drug_exposure"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Drug Eras",
          routeName: "domain_table",
          domain: "drug_era"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Visit Occurrence",
          routeName: "domain_table",
          domain: "visit_occurrence"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Visit Detail",
          routeName: "domain_table",
          domain: "visit_detail"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Measurements",
          routeName: "domain_table",
          domain: "measurement"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Observations",
          routeName: "domain_table",
          domain: "observation"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Procedures",
          routeName: "domain_table",
          domain: "procedure_occurrence"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Device Exposures",
          routeName: "domain_table",
          domain: "device_exposure"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Death",
          routeName: "death"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Unmapped Source Codes",
          routeName: "unmapped_source_codes"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-speedometer",
          name: "Performance",
          routeName: "performance"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-alpha-m-circle-outline",
          name: "Metadata",
          routeName: "metadata"
        },
        {
          folder: "Data Network",
          icon: "mdi-table",
          name: "Overview",
          routeName: "overview"
        },
        {
          folder: "Data Network",
          icon: "mdi-sigma-lower",
          name: "Quality Assessment",
          routeName: "network_data_quality"
        },
        {
          folder: "Data Network",
          icon: "mdi-chart-line",
          name: "Population Overview",
          routeName: "population"
        },
        {
          folder: "Data Network",
          icon: "mdi-dna",
          name: "Data Strand Report",
          routeName: "data_strand_report"
        },
      ],
    };
  },

  created() {
    axios
      .get("data/index.json")
      .then((response) => {
        this.networkIndex = response.data.dataQualityRecords;
        this.sources = response.data.sources;
        this.folder = response.data.folder
      })
      .catch((err) => {
        console.log("explorer failed to load network index");
        console.log(err);
      });
  },

  computed: {

    getFolder: function () {
      return this.folders.find(folder =>
          this.$route.matched.some(route =>
              route.name === folder.key));
    },
    getFilteredReports: function () {
      return this.reports.filter((report) =>
          report.folder === this.getFolder.name);
    },
    getSource: function () {
      return this.sources.find(source =>
          this.$route.params.cdm === source.cdm_source_key);
    },
    getReleases: function () {
      return this.getSource.releases;
    },
    getSelectedRelease: function () {
      return this.getReleases.find(release =>
          this.$route.params.release === release.release_id)
    },
    getSelectedReport: function () {
      return this.getFilteredReports.find(report =>
          report.domain ?
              this.$route.params.domain === report.domain :
              this.$route.matched.some(route => route.name === report.routeName)
      )
    },
    showConceptSelector: function () {
      return this.$route.params.concept;
    },
    showSourceSelector: function () {
      return (this.getFolder.key === "_datasource" ||
          this.getFolder.key === "_cdm");
    },
    showReleaseSelector: function () {
      return this.getFolder.key === "_cdm";
    },
  },

  methods: {
    changeSource(data) {
      this.$router.push({
            params: {
              ...this.$route.params,
              cdm: data.cdm_source_key,
              release: data.releases[0].release_id
            }
          }
      )
    },
    changeRelease(data) {
      this.$router.push({
        params: {
          ...this.$route.params,
          release: data.release_id
        }
      })
    },
    changeFolder(data) {
      this.$router.push({
        name: data.key,
        params: {
          cdm: this.sources[0].cdm_source_key,
          release: this.sources[0].releases[0].release_id
        }
      })
    },
    changeReport(data) {
      this.$router.push({
        name: data.routeName,
        params: {
          ...this.$route.params,
          domain: data.domain,
          concept: ''
        }
      });
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
