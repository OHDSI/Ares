<template>
  <div>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Domain Density</v-card-title>
      <div id="viz-overview" style="width: 80%"></div>
    </v-card>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Domain Records per Person</v-card-title>
      <div id="viz-recordsperperson" style="width: 80%"></div>
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
  computed: {},
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
      this.dataLoaded = false;
      const dataRequests = [];

      const urlRecordsPerPerson =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/datadensity-records-per-person.csv";

      const urlOverview =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/datadensity-total.csv";

      dataRequests.push(axios.get(urlRecordsPerPerson));
      dataRequests.push(axios.get(urlOverview));

      axios.all(dataRequests).then(
        axios.spread((...responses) => {
          this.defRecordsPerPerson.data = {
            values: d3Import.csvParse(responses[0].data),
          };
          this.defOverview.data = {
            values: d3Import.csvParse(responses[1].data),
          };

          embed("#viz-overview", this.defOverview);
          embed("#viz-recordsperperson", this.defRecordsPerPerson);
          this.dataLoaded = true;
        })
      );
    },
  },
};
</script>

<style scoped></style>
