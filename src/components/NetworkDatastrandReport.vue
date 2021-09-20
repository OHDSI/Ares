<template>
  <v-responsive min-width="900">
    <explorer></explorer>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Data Strands</v-card-title>
      <div class="viz-container" id="viz-datastrand"></div>
      <infopanel
        details="Data strands are simple visualizations that describe the composition of
        a data source across the various CDM domain tables. Each individual
        strand shows the percentage of the data source comprised of data from a
        particular domain table. Across the network, the strands can be visually
        compared and contrasted."
      ></infopanel>
    </v-card>
  </v-responsive>
</template>

<script>
import embed from "vega-embed";
import axios from "axios";
import explorer from "./Explorer.vue";
import infopanel from "./InfoPanel.vue";
import * as d3 from "d3-dsv";

export default {
  data() {
    return {
      dataLoaded: false,
      sources: [],
      cdmSourceName: "",
      specDatastrand: {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "Data Strand Visualization",
        autosize: { type: "fit-x", contains: "padding" },
        background: "white",
        padding: 5,
        data: [
          {
            name: "source_0",
            values: [],
          },
          {
            name: "data_0",
            source: "source_0",
            transform: [
              {
                type: "filter",
                expr:
                  "indexof(['condition occurrence','drug exposure','measurement','observation','procedure occurrence','visit occurrence','device exposure'], lower(datum.domain)) >= 0",
              },
              {
                type: "joinaggregate",
                as: ["total_records"],
                ops: ["sum"],
                fields: ["count_records"],
                groupby: ["cdm_source_key"],
              },
              {
                type: "formula",
                expr: "datum.count_records/datum.total_records",
                as: "percent",
              },
              {
                type: "aggregate",
                groupby: [
                  "domain",
                  "percent",
                  "count_records",
                  "cdm_source_key",
                  "cdm_source_abbreviation",
                  "cdm_release_key",
                ],
                ops: ["sum", "sum"],
                fields: ["percent", "count_records"],
                as: ["sum_percent", "sum_count_records"],
              },
              {
                type: "stack",
                groupby: ["cdm_source_key"],
                field: "sum_percent",
                sort: { field: ["sum_count_records"], order: ["descending"] },
                as: ["sum_percent_start", "sum_percent_end"],
                offset: "zero",
              },
              {
                type: "filter",
                expr:
                  'isValid(datum["sum_percent"]) && isFinite(+datum["sum_percent"])',
              },
            ],
          },
        ],
        signals: [
          {
            name: "selectDomain",
            on: [{ events: "mousedown", update: "datum" }],
          },
          {
            name: "width",
            init: "isFinite(containerSize()[0]) ? containerSize()[0] : 200",
            on: [
              {
                update:
                  "isFinite(containerSize()[0]) ? containerSize()[0] : 200",
                events: "window:resize",
              },
            ],
          },
          { name: "y_step", value: 20 },
          {
            name: "height",
            update: "bandspace(domain('y').length, 3, 3) * y_step",
          },
        ],
        marks: [
          {
            name: "marks",
            type: "rect",
            style: ["bar"],
            from: { data: "data_0" },
            encode: {
              enter: {
                stroke: { value: "#ffffff" },
                strokeWidth: { value: 7 },
              },
              update: {
                cornerRadius: { value: 10 },
                fill: { scale: "color", field: "domain" },
                tooltip: {
                  signal:
                    '{"Data Source": datum["cdm_source_abbreviation"], "Domain": isValid(datum["domain"]) ? datum["domain"] : ""+datum["domain"], "Percent": format(datum["sum_percent"], "0.2%"), "Number of Records": format(datum["count_records"], ",")}',
                },
                x: { scale: "x", field: "sum_percent_end" },
                x2: { scale: "x", field: "sum_percent_start" },
                yc: { scale: "y", field: "cdm_source_key" },
                height: { value: 20 },
              },
            },
          },
        ],
        scales: [
          {
            name: "x",
            type: "linear",
            domain: {
              data: "data_0",
              fields: ["sum_percent_start", "sum_percent_end"],
            },
            range: [0, { signal: "width" }],
            nice: true,
            zero: true,
          },
          {
            name: "y",
            type: "band",
            domain: { data: "data_0", field: "cdm_source_key", sort: true },
            range: { step: { signal: "y_step" } },
            padding: 3,
          },
          {
            name: "color",
            type: "ordinal",
            domain: { data: "data_0", field: "domain", sort: true },
            range: "category",
          },
        ],
        axes: [{ scale: "y", orient: "left", zindex: 0 }],
        legends: [
          {
            columns: 3,
            columnPadding: 20,
            rowPadding: 10,
            orient: "bottom",
            fill: "color",
            direction: "horizontal",
            symbolType: "circle",
          },
        ],
      },
    };
  },
  components: {
    explorer,
    infopanel,
  },
  created() {
    this.load();
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
    load: function () {
      var vm = this;
      var sourceRequests = [];
      var domainData = [];

      // first get network data source listing
      axios.get("data/index.json").then((response) => {
        vm.sources = response.data.sources;
        vm.sources.forEach((source) => {
          var dataUrl =
            "data/" +
            source.cdm_source_key +
            "/" +
            source.releases[0].release_id +
            "/records-by-domain.csv";

          sourceRequests.push(axios.get(dataUrl));

          // get concept summary data for each network data source
          axios.all(sourceRequests).then(
            axios.spread((...responses) => {
              vm.componentFailed = false;
              vm.dataLoaded = true;

              responses.forEach((r, i) => {
                var responseData = d3.csvParse(r.data);
                responseData.forEach((d) => {
                  d.cdm_source_key = vm.sources[i].cdm_source_key;
                  d.cdm_release_key = vm.sources[i].releases[0].release_id;
                  d.cdm_source_abbreviation =
                    vm.sources[i].cdm_source_abbreviation;
                });
                domainData = domainData.concat(responseData);
              });
              vm.specDatastrand.data[0].values = domainData;
              vm.dataLoaded = true;

              embed("#viz-datastrand", vm.specDatastrand).then((result) => {
                result.view.addSignalListener("selectDomain", (name, value) => {
                  var domainKey = value.domain.toLowerCase().replace(" ", "_");
                  var routeUrl =
                    "/_cdm/" +
                    value.cdm_source_key +
                    "/" +
                    value.cdm_release_key +
                    "/domain/" +
                    domainKey +
                    "/summary";
                  vm.navigate(routeUrl);
                });
              });
            })
          );
        });
      });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 95%;
}
</style>