<template>
  <div>
    <div v-if="componentFailed">
      <error :text="errorText" :details="errorDetails"></error>
      <ReturnButton block />
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Death Report</div>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Age at Death </v-card-title>
          <div id="viz-ageatdeath" class="viz-container"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Death by Type</v-card-title>
          <div id="viz-deathbytype" class="viz-container"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title
            >Record Count Proportion by Age, Sex, and Year</v-card-title
          >
          <div
            id="viz-recordproportionbyagesexyear"
            class="viz-container"
          ></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Record Count Proportion by Month</v-card-title>
          <div id="viz-recordproportionbymonth" class="viz-container"></div>
          <v-card-text>
            <v-layout align-baseline>
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Proportion of people with at least one record per 1000 people.
            </v-layout>
          </v-card-text>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import embed from "vega-embed";
import error from "../../components/Error.vue";
import * as d3 from "d3-time-format";
import ReturnButton from "@/interface/components/ReturnButton";
import sortByRange from "@/services/range-sort";

export default {
  components: {
    ReturnButton,
    error,
  },
  data() {
    return {
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      deathData: null,
      dataLoaded: false,
      specDeathByType: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        height: 75,
        mark: "bar",
        transform: [
          {
            window: [
              {
                op: "sum",
                field: "COUNT_VALUE",
                as: "TOTAL_VALUE",
              },
            ],
            frame: [null, null],
          },
          {
            calculate: "datum.COUNT_VALUE/datum.TOTAL_VALUE",
            as: "PERCENT",
          },
        ],
        encoding: {
          tooltip: [
            { field: "CONCEPT_NAME", title: "Condition Type" },
            { field: "COUNT_VALUE", title: "Number of Records" },
            { field: "PERCENT", title: "% of Records", format: "0.2%" },
          ],
          x: {
            field: "PERCENT",
            aggregate: "sum",
            title: "% of Records",
            format: "0%",
            axis: {
              format: "0%",
            },
          },
          color: {
            field: "CONCEPT_NAME",
            type: "nominal",
            legend: {
              orient: "right",
              columns: 2,
              title: null,
            },
          },
          order: {
            aggregate: "sum",
            field: "COUNT_VALUE",
            sort: "descending",
          },
        },
      },
      specAgeAtDeath: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 100,
        width: "container",
        data: {},
        encoding: { y: { field: "CATEGORY", type: "nominal", title: null } },
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: null,
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 14, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
              color: { field: "CATEGORY", type: "nominal", legend: null },
            },
          },
          {
            mark: { type: "tick", color: "white", size: 14 },
            encoding: {
              x: { field: "MEDIAN_VALUE", type: "quantitative" },
            },
          },
        ],
      },
      specRecordProportionByAgeSexYear: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: {},
        spacing: 10,
        autosize: { resize: true },
        facet: {
          row: {
            field: "TRELLIS_NAME",
            title: "Age Deciles",
            sort: { field: "trellisOrder" },
          },
          field: "TRELLIS_NAME",
          type: "nominal",
          title: null,
        },
        spec: {
          width: "container",
          height: 30,
          encoding: {
            x: {
              field: "X_CALENDAR_YEAR",
              type: "quantitative",
              title: "",
              axis: {
                format: "d",
              },
            },
            y: {
              field: "Y_PREVALENCE_1000PP",
              type: "quantitative",
              title: "",
            },
            color: {
              title: "Sex",
              field: "SERIES_NAME",
              type: "nominal",
              legend: {
                orient: "right",
                offset: 5,
              },
            },
            tooltip: [
              { field: "X_CALENDAR_YEAR", title: "Year" },
              {
                field: "Y_PREVALENCE_1000PP",
                title: "Record Proportion per 1000",
              },
              { field: "TRELLIS_NAME", title: "Age Decile" },
            ],
          },
          layer: [
            {
              mark: { type: "line", interpolate: "linear" },
              params: [
                {
                  name: "source",
                  select: { type: "point", fields: ["SERIES_NAME"] },
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
              selection: {
                dataSource: {
                  type: "multi",
                  fields: ["SERIES_NAME"],
                  bind: "legend",
                },
                x: {
                  type: "single",
                  on: "mousemove",
                  encodings: ["x"],
                  nearest: true,
                },
              },
              transform: [
                {
                  filter: { selection: "dataSource" },
                },
              ],
              mark: { type: "point", tooltip: true },
            },
            {
              transform: [
                {
                  filter: {
                    and: ["x.X_CALENDAR_YEAR", { selection: "x" }],
                  },
                },
                { filter: { selection: "dataSource" } },
              ],
              layer: [
                {
                  mark: "rule",
                  encoding: {
                    y: {
                      height: 1,
                    },
                    color: {
                      value: "black",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
      specRecordProportionByMonth: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        vconcat: [
          {
            height: 150,
            width: "container",
            mark: { type: "circle" },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                timeUnit: "yearmonth",
                scale: { domain: { selection: "brush" } },
                axis: { title: "" },
              },
              y: {
                field: "Y_PREVALENCE_1000PP",
                type: "quantitative",
                title: "Record Proportion per 1000",
              },
              tooltip: [
                {
                  field: "Y_PREVALENCE_1000PP",
                  title: "RPP1000",
                  type: "quantitative",
                },
                {
                  field: "date",
                  title: "Date",
                  type: "temporal",
                  timeUnit: "yearmonth",
                },
              ],
            },
          },
          {
            width: "container",
            height: 25,
            mark: "line",
            selection: {
              brush: { type: "interval", encodings: ["x"] },
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                title: "Date",
                timeUnit: "yearmonth",
              },
              y: {
                field: "Y_PREVALENCE_1000PP",
                type: "quantitative",
                title: "",
              },
            },
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
    load: function () {
      this.dataLoaded = false;
      this.deathData = [];
      const dataUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/death.json";
      axios
        .get(dataUrl)
        .then((response) => {
          this.componentFailed = false;
          const dateParse = d3.timeParse("%Y%m");
          this.deathData = response.data;

          this.specAgeAtDeath.data = {
            values: this.deathData.AGE_AT_DEATH,
          };
          embed("#viz-ageatdeath", this.specAgeAtDeath);

          this.specDeathByType.data = {
            values: this.deathData.DEATH_BY_TYPE,
          };
          embed("#viz-deathbytype", this.specDeathByType);

          this.specRecordProportionByAgeSexYear.data = {
            values: sortByRange(
              this.deathData.PREVALENCE_BY_GENDER_AGE_YEAR,
              "ascending",
              "TRELLIS_NAME",
              "trellisOrder"
            ),
          };

          embed(
            "#viz-recordproportionbyagesexyear",
            this.specRecordProportionByAgeSexYear
          );

          this.deathData.PREVALENCE_BY_MONTH.forEach((v, i) => {
            this.deathData.PREVALENCE_BY_MONTH[i].date = dateParse(
              v.X_CALENDAR_MONTH
            );
          });
          this.specRecordProportionByMonth.data = {
            values: this.deathData.PREVALENCE_BY_MONTH,
          };
          embed(
            "#viz-recordproportionbymonth",
            this.specRecordProportionByMonth
          );

          this.dataLoaded = true;
        })
        .catch((err) => {
          this.componentFailed = true;
          this.errorText = "Failed to obtain death summary data file.";
          this.errorDetails = err + " (" + dataUrl + ") ";
        });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
