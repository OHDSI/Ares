<template>
  <div>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Domain Density</v-card-title>
      <div style="width: 80%" id="viz-overview"></div>
    </v-card>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Domain Records per Person</v-card-title>
      <div style="width: 80%" id="viz-recordsperperson"></div>
    </v-card>
  </div>
</template>

<script>
import embed from "vega-embed";
import axios from "axios";
import * as d3Import from "d3-dsv";

export default {
  data() {
    return {
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      defRecordsPerPerson: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        vconcat: [
          {
            height: 150,
            width: "container",
            description: "Domain Data Density",
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                axis: { title: "Date" },
                scale: { domain: { selection: "brush" } },
              },
              y: {
                field: "records",
                type: "quantitative",
                title: "Records",
                format: ",",
              },
              color: { field: "domain", type: "nominal" },
            },
            layer: [
              {
                mark: { type: "line", interpolate: "linear" },
                params: [
                  {
                    name: "source",
                    select: { type: "point", fields: ["domain"] },
                    bind: "legend",
                  },
                ],
                encoding: {
                  opacity: {
                    condition: { param: "source", value: 1 },
                    value: 0.2,
                  },
                },
              },
              {
                transform: [{ filter: { param: "source" } }],
                mark: { type: "point", tooltip: true },
                encoding: {
                  tooltip: [
                    {
                      field: "records",
                      type: "quantitative",
                      title: "Records per person",
                      format: ",",
                    },
                    {
                      field: "date",
                      type: "temporal",
                      title: "Date",
                    },
                  ],
                },
              },
            ],
          },

          {
            width: "container",
            height: 50,
            encoding: {
              x: { field: "date", type: "temporal", title: "Date" },
              y: {
                field: "records",
                type: "quantitative",
                axis: { title: "" },
              },
              color: { field: "domain", type: "nominal", title: "Domain" },
            },
            layer: [
              {
                mark: { type: "line", interpolate: "linear" },
                selection: {
                  brush: { type: "interval", encodings: ["x"] },
                },
                params: [
                  {
                    name: "source",
                    select: { type: "point", fields: ["domain"] },
                    bind: "legend",
                  },
                ],
                encoding: {
                  opacity: {
                    condition: { param: "source", value: 1 },
                    value: 0.2,
                  },
                },
              },
              {
                transform: [{ filter: { param: "source" } }],
                mark: { type: "point", tooltip: true },
              },
            ],
          },
        ],
      },

      defOverview: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        vconcat: [
          {
            height: 150,
            width: "container",
            description: "Domain Data Density",
            selection: {
              domain: { type: "multi", fields: ["domain"], bind: "legend" },
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                scale: { domain: { selection: "brush" } },
                title: "Date",
              },
              y: {
                field: "records",
                type: "quantitative",
                title: "Records",
              },
              color: { field: "domain", type: "nominal" },
            },
            layer: [
              {
                mark: { type: "line", interpolate: "linear" },
                params: [
                  {
                    name: "source",
                    select: { type: "point", fields: ["domain"] },
                    bind: "legend",
                  },
                ],
                encoding: {
                  opacity: {
                    condition: { param: "source", value: 1 },
                    value: 0.2,
                  },
                },
              },
              {
                transform: [{ filter: { param: "source" } }],
                mark: { type: "point", tooltip: true },
                encoding: {
                  tooltip: [
                    {
                      field: "records",
                      type: "quantitative",
                      title: "# Records",
                      format: ",",
                    },
                    {
                      field: "date",
                      type: "temporal",
                      title: "Date",
                    },
                  ],
                },
              },
            ],
          },
          {
            width: "container",
            height: 50,
            mark: "line",
            selection: {
              brush: { type: "interval", encodings: ["x"] },
            },
            encoding: {
              x: { field: "date", type: "temporal", title: "Date" },
              y: {
                field: "records",
                type: "quantitative",
                axis: { title: "" },
              },
              color: { field: "domain", type: "nominal" },
            },
            layer: [
              {
                mark: { type: "line", interpolate: "linear" },
                selection: {
                  brush: { type: "interval", encodings: ["x"] },
                },
                params: [
                  {
                    name: "source",
                    select: { type: "point", fields: ["domain"] },
                    bind: "legend",
                  },
                ],
                encoding: {
                  opacity: {
                    condition: { param: "source", value: 1 },
                    value: 0.2,
                  },
                },
              },
              {
                transform: [{ filter: { param: "source" } }],
                mark: { type: "point", tooltip: true },
              },
            ],
          },
        ],
      },
    };
  },
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    load: function () {
      var self = this;
      var dataRequests = [];

      var urlRecordsPerPerson =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/datadensity-records-per-person.csv";

      var urlOverview =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/datadensity-total.csv";

      dataRequests.push(axios.get(urlRecordsPerPerson));
      dataRequests.push(axios.get(urlOverview));

      axios.all(dataRequests).then(
        axios.spread((...responses) => {
          self.defRecordsPerPerson.data = {
            values: d3Import.csvParse(responses[0].data),
          };
          self.defOverview.data = {
            values: d3Import.csvParse(responses[1].data),
          };

          embed("#viz-overview", self.defOverview);
          embed("#viz-recordsperperson", self.defRecordsPerPerson);
          self.dataLoaded = true;
        })
      );
    },
  },
  computed: {},
};
</script>

<style scoped></style>
