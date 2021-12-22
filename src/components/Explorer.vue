<template>
  <div v-if="dataLoaded" id="explorer" class="pa-2">
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
          :value="getSelectedFolder"
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
          :items="sources"
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
import axios from "axios";

export default {
  name: "Explorer",
  props: {},
  data() {
    return {
      networkIndex: [],
      dataLoaded: false,
      folders: [
        {
          icon: "mdi-network",
          name: "Data Network",
          key: "network"
        },
        {
          icon: "mdi-database",
          name: "Data Source",
          key: "datasource"
        },
        {
          icon: "mdi-database-clock",
          name: "Data Source Release",
          key: "cdm"
        }
        /*
        {
          icon: "mdi-bug",
          name: "System Diagnostics",
          route: "/_system",
        },

        */
      ],
      sources: [],
      reports: [
        {
          folder: "Data Source Release",
          icon: "mdi-sigma-lower",
          name: "Data Quality",
          routeName: "dataQuality"
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
          routeName: "dataDensity"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-chart-line",
          name: "Observation Period",
          routeName: "observationPeriod"
        },
        {
          folder: "Data Source",
          name: "Data Quality History",
          routeName: "dataQualityHistory"
        },
        {
          folder: "Data Source",
          name: "Domain Continuity",
          routeName: "domainContinuity"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Conditions",
          routeName: "domainTable",
          domain: "condition_occurrence"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Condition Eras",
          routeName: "domainTable",
          domain: "condition_era"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Drugs",
          routeName: "domainTable",
          domain: "drug_exposure"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Drug Eras",
          routeName: "domainTable",
          domain: "drug_era"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Visit Occurrence",
          routeName: "domainTable",
          domain: "visit_occurrence"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Visit Detail",
          routeName: "domainTable",
          domain: "visit_detail"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Measurements",
          routeName: "domainTable",
          domain: "measurement"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Observations",
          routeName: "domainTable",
          domain: "observation"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Procedures",
          routeName: "domainTable",
          domain: "procedure_occurrence"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Device Exposures",
          routeName: "domainTable",
          domain: "device_exposure"
        },
        {
          folder: "Data Source Release",
          icon: "mdi-table",
          name: "Providers",
          routeName: "domainTable",
          domain: "provider"
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
          routeName: "unmappedSourceCodes"
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
          routeName: "networkDataQuality"
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
          routeName: "dataStrandReport"
        }
      ]
    };
  },

  computed: {
    getSelectedFolder: function() {
      return this.folders.find(folder =>
        this.$route.matched.some(route => route.name === folder.key)
      );
    },
    getFilteredReports: function() {
      return this.reports.filter(
        report => report.folder === this.getSelectedFolder.name
      );
    },
    getSelectedSource: function() {
      return this.sources.find(
        source => this.$route.params.cdm === source.cdm_source_key
      );
    },
    getReleases: function() {
      return this.getSelectedSource.releases;
    },
    getSelectedRelease: function() {
      return this.getReleases.find(
        release => this.$route.params.release === release.release_id
      );
    },
    getSelectedReport: function() {
      return this.getFilteredReports.find(report =>
        report.domain
          ? this.$route.params.domain === report.domain
          : this.$route.matched.some(route => route.name === report.routeName)
      );
    },
    showConceptSelector: function() {
      return this.$route.params.concept;
    },
    showSourceSelector: function() {
      return (
        this.getSelectedFolder.key === "datasource" ||
        this.getSelectedFolder.key === "cdm"
      );
    },
    showReleaseSelector: function() {
      return this.getSelectedFolder.key === "cdm";
    }
  },

  created() {
    axios
      .get("data/index.json")
      .then(response => {
        this.networkIndex = response.data.dataQualityRecords;
        this.sources = response.data.sources;
        this.folder = response.data.folder;
        this.dataLoaded = true;
      })
      .catch(err => {
        console.log("explorer failed to load network index");
        console.log(err);
      });
  },

  methods: {
    changeSource(data) {
      this.$router.push({
        params: {
          ...this.$route.params,
          cdm: data.cdm_source_key,
          release: data.releases[0].release_id
        }
      });
    },
    changeRelease(data) {
      this.$router.push({
        params: {
          ...this.$route.params,
          release: data.release_id
        }
      });
    },
    changeFolder(data) {
      this.$router.push({
        name: data.key,
        params: {
          cdm: this.getSelectedSource
            ? this.getSelectedSource.cdm_source_key
            : this.sources[0].cdm_source_key,
          release: this.getSelectedSource
            ? this.getSelectedRelease.release_id
            : this.sources[0].releases[0].release_id
        }
      });
    },
    changeReport(data) {
      this.$router.push({
        name: data.routeName,
        params: {
          ...this.$route.params,
          domain: data.domain,
          concept: ""
        }
      });
    }
  }
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
