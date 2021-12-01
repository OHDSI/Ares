<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6">{{
          conceptName
        }}</v-layout>
        <v-row v-if="dataLoaded" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="numPersons"
            ></v-badge>
            <p class="text-caption">Number of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon small left color="info">mdi-percent</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="formatPercent(percentPersons)"
            ></v-badge>
            <p class="text-caption">% of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-table-row</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="recordsPerPerson"
            ></v-badge>
            <p class="text-caption">Records per Person</p></v-col
          ><v-col v-if="hasCountFailed" cols="2" align="center">
            <v-icon left color="error" @click="navigateToDataQuality()"
              >mdi-database-alert</v-icon
            >
            <v-badge
              tile
              inline
              dark
              color="error"
              :content="countFailed"
            ></v-badge>
            <p class="text-caption">Data Quality Issues</p></v-col
          ><v-col v-if="isNotStationary" cols="2" align="center">
            <v-icon left color="error">mdi-clock-alert</v-icon>
            <p class="text-caption">Non-Stationary Time Series</p></v-col
          ></v-row
        >
        <v-card
          :loading="!dataLoaded"
          v-if="hasMeasurementValueDistribution"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Measurement Value Distributions</v-card-title>
          <v-layout class="pa-4" justify-end>
            <v-btn small color="primary" @click="toggleMeasurementValueChart()"
              ><v-icon dark left>mdi-toggle-switch</v-icon
              >{{ toggleMode }}</v-btn
            >
          </v-layout>
          <div
            class="viz-container"
            id="viz-measurementvaluedistribution"
          ></div>
          <v-card-text>
            <v-layout>
              <router-link :to="getNetworkConceptRoute()">
                <v-icon small color="primary" left>mdi-check-network</v-icon
                >Check measurement value distributions across the network
              </router-link>
            </v-layout>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>
        <v-card
          :loading="!dataLoaded"
          v-if="hasAgeAtFirstDiagnosis"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Age at First Diagnosis</v-card-title>
          <div class="viz-container" id="viz-ageatfirstdiagnosis"></div>
          <v-card-text>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>
        <v-card
          :loading="!dataLoaded"
          v-if="hasAgeAtFirstExposure"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Age at First Exposure</v-card-title>
          <div class="viz-container" id="viz-ageatfirstexposure"></div>
          <v-card-text>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasLengthOfEra"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Length of Era</v-card-title>
          <div class="viz-container" id="viz-lengthofera"></div>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasConditionsByType"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Conditions by Type</v-card-title>
          <div class="viz-container" id="viz-conditionsbytype"></div>
          <v-card-text>
            <a
              href="https://ohdsi.github.io/CommonDataModel/cdm531.html#CONDITION_OCCURRENCE"
              target="_blank"
            >
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Learn about Condition types.
            </a>
          </v-card-text>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasDrugsByType"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Drugs by Type</v-card-title>
          <div class="viz-container" id="viz-drugsbytype"></div>
          <v-card-text>
            <a
              href="https://ohdsi.github.io/CommonDataModel/cdm531.html#DRUG_EXPOSURE"
              target="_blank"
            >
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Learn about Drug types.
            </a>
          </v-card-text>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasRecordsByUnit"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Records by Unit</v-card-title>
          <div class="viz-container" id="viz-recordsbyunit"></div>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasMeasurementsByType"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Measurements by Type</v-card-title>
          <div class="viz-container" id="viz-measurementsbytype"></div>
          <v-card-text>
            <a
              href="https://ohdsi.github.io/CommonDataModel/cdm531.html#MEASUREMENT"
              target="_blank"
            >
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Learn about Measurement types.
            </a>
          </v-card-text>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasAgeAtFirstOccurrence"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Age at First Occurrence</v-card-title>
          <div class="viz-container" id="viz-ageatfirstoccurrence"></div>
          <info-panel
            details="Learn how to interpret this plot"
            routeLink="/help"
          ></info-panel>
        </v-card>

        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Record Count Proportion by Month</v-card-title>
          <div class="viz-container" id="viz-recordproportionbymonth"></div>
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
          <info-panel
            v-if="isNotStationary"
            icon="mdi-clock-alert"
            details="This time series has been deemed non-stationary by temporal characterization."
            :divider="false"
          ></info-panel>
          <info-panel
            v-if="hasSeasonalityScore"
            icon="mdi-clock-alert"
            :details="seasonalityComment"
            :divider="false"
            link="http://www.github.com/ohdsi/castor"
          ></info-panel>
          <info-panel
            icon="mdi-database-clock"
            :divider="false"
            :linkDetails="true"
            :routeLink="getSourceConceptReportLink()"
            details="Review this Time-Series across data source releases."
          ></info-panel>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasDaysSupply"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Days Supply</v-card-title>
          <div class="viz-container" id="viz-dayssupply"></div>
          <info-panel
            details="Learn how to interpret this plot"
            routeLink="/help"
          ></info-panel>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasQuantity"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Quantity</v-card-title>
          <div class="viz-container" id="viz-quantity"></div>
          <info-panel
            details="Learn how to interpret this plot"
            routeLink="/help"
          ></info-panel>
        </v-card>

        <v-card
          :loading="!dataLoaded"
          v-if="hasVisitDurationByType"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Visit Duration by Type</v-card-title>
          <div class="viz-container" id="viz-visitdurationbytype"></div>
        </v-card>

        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>
            Record Count Proportion by Age, Sex, and Year
          </v-card-title>
          <div
            class="viz-container"
            id="viz-recordproportionbyagesexyear"
          ></div>
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import embed from "vega-embed";
import error from "./Error.vue";
import * as d3 from "d3-time-format";
import * as d3Format from "d3-format";
import InfoPanel from "./InfoPanel.vue";
import dataService from "../services/DataService";

export default {
  data() {
    return {
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      toggleMode: "P10/P90",
      hasMeasurementValueDistribution: false,
      hasAgeAtFirstDiagnosis: false,
      hasAgeAtFirstOccurrence: false,
      hasAgeAtFirstExposure: false,
      hasRecordsByUnit: false,
      hasConditionsByType: false,
      hasMeasurementsByType: false,
      hasDrugsByType: false,
      hasVisitDurationByType: false,
      hasDaysSupply: false,
      hasQuantity: false,
      hasLengthOfEra: false,
      hasCountFailed: false,
      isNotStationary: false,
      hasSeasonalityScore: false,
      seasonalityScore: 0,
      seasonalityComment: "",
      countFailed: 0,
      conceptData: null,
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      specConditionsByType: {
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
      specDrugsByType: {
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
            { field: "CONCEPT_NAME", title: "Drug Type" },
            { field: "COUNT_VALUE", title: "Number of Records", format: "," },
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
      specRecordsByUnit: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        autosize: "fit",
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
            { field: "CONCEPT_NAME", title: "Unit Type" },
            { field: "COUNT_VALUE", title: "Number of Records", format: "," },
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
              title: null,
              columns: 2,
            },
          },
          order: {
            aggregate: "sum",
            field: "COUNT_VALUE",
            sort: "descending",
          },
        },
      },
      specRecordProportionByAgeSexYear: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: 60,
        height: 150,
        data: {},
        mark: "line",
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
            },
          },
          facet: {
            field: "TRELLIS_NAME",
            type: "nominal",
            title: null,
            sort: { field: "trellisOrder" },
            rows: 1,
            spacing: 20,
            header: {
              title: "Age Deciles",
              labelOrient: "top",
              labelAnchor: "start",
              labelFontSize: 10,
              labelPadding: 5,
            },
          },
        },
      },
      specMeasurementValueDistribution: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: {"step": "20"},
        width: "container",
        data: {},
        encoding: { y: { field: "CATEGORY", type: "nominal", title: null } },
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "P10_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: null,
              },
              x2: { field: "P90_VALUE" },
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
        row: {
          field: "CATEGORY",
          type: "nominal",
          title: "Measurement",
        },
      },
      specMeasurementsByType: {
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
            { field: "CONCEPT_NAME", title: "Measurement Type" },
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
      specAgeAtFirstOccurrence: {
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
      specVisitDurationByType: {
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
      specDaysSupply: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 100,
        width: "container",
        data: {},
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: "Days Supply",
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 28, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
            },
          },
          {
            mark: { type: "tick", color: "white", size: 28 },
            encoding: {
              x: { field: "MEDIAN_VALUE", type: "quantitative" },
            },
          },
        ],
      },
      specQuantity: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 100,
        width: "container",
        data: {},
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: "Amount",
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 28, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
            },
          },
          {
            mark: { type: "tick", color: "white", size: 28 },
            encoding: {
              x: { field: "MEDIAN_VALUE", type: "quantitative" },
            },
          },
        ],
      },
      specLengthOfEra: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 100,
        width: "container",
        data: {},
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: "Number of Days",
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 28, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
            },
          },
          {
            mark: { type: "tick", color: "white", size: 28 },
            encoding: {
              x: { field: "MEDIAN_VALUE", type: "quantitative" },
            },
          },
        ],
      },
      specAgeAtFirstExposure: {
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
              tooltip: {
                field: "MAX_VALUE",
              },
            },
          },
          {
            mark: { type: "bar", size: 14, tooltip: {} },
            encoding: {
              x: {
                field: "P25_VALUE",
                type: "quantitative",
              },
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
      specAgeAtFirstDiagnosis: {
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
      specRecordProportionByMonth: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        vconcat: [
          {
            height: 150,
            width: "container",
            description: "Domain Data Density",
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
  components: {
    error,
    InfoPanel,
  },
  created() {
    this.load();
  },
  updated() {
    this.load();
  },
  methods: {
    getSourceConceptReportLink: function () {
      return (
        "/datasource/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.domain +
        "/" +
        this.$route.params.concept +
        "/overlay"
      );
    },
    toggleMeasurementValueChart() {
      let encoding = this.specMeasurementValueDistribution.layer[0].encoding;

      if (this.toggleMode === "MIN/MAX") {
        encoding.x.field = "P10_VALUE";
        encoding.x2.field = "P90_VALUE";
        this.toggleMode = "P10/P90";
      } else {
        encoding.x.field = "MIN_VALUE";
        encoding.x2.field = "MAX_VALUE";
        this.toggleMode = "MIN/MAX";
      }
      embed(
        "#viz-measurementvaluedistribution",
        this.specMeasurementValueDistribution
      ).then(() => {
        window.dispatchEvent(new Event("resize"));
      });
    },
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    getNetworkConceptRoute() {
      return (
        "/network/concept/" +
        this.$route.params.domain +
        "/" +
        this.$route.params.concept +
        "/summary"
      );
    },
    navigateToDataQuality() {
      this.$router.push({
        path:
          "/cdm/" +
          this.$route.params.cdm +
          "/" +
          this.$route.params.release +
          "/data_quality?tab=results&conceptFailFilter=" +
          this.$route.params.concept,
      });
    },
    load: function () {
      let dataUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/concepts/" +
        this.$route.params.domain +
        "/concept_" +
        this.$route.params.concept +
        ".json";
      axios
        .get(dataUrl)
        .then((response) => {
          this.componentFailed = false;
          let dateParse = d3.timeParse("%Y%m");
          this.conceptData = response.data;
          this.conceptName = response.data.CONCEPT_NAME[0];
          this.conceptId = response.data.CONCEPT_ID[0];
          this.numPersons = this.formatComma(response.data.NUM_PERSONS[0]);
          this.percentPersons = response.data.PERCENT_PERSONS[0];
          this.recordsPerPerson = response.data.RECORDS_PER_PERSON[0];

          if (this.conceptData.COUNT_FAILED) {
            this.hasCountFailed = true;
            this.countFailed = this.conceptData.COUNT_FAILED[0];
          }

          if (this.conceptData.IS_STATIONARY) {
            this.isNotStationary = !this.conceptData.IS_STATIONARY[0];
          }

          if (this.conceptData.SEASONALITY_SCORE) {
            this.hasSeasonalityScore = true;
            this.seasonalityScore = this.conceptData.SEASONALITY_SCORE[0];
            this.seasonalityComment =
              "Seasonality score of " + this.seasonalityScore + ".";
          }

          if (this.conceptData.LENGTH_OF_ERA) {
            this.specLengthOfEra.data = {
              values: this.conceptData.LENGTH_OF_ERA,
            };
            this.hasLengthOfEra = true;
            embed("#viz-lengthofera", this.specLengthOfEra).then(() => {
              window.dispatchEvent(new Event("resize"));
            });
          }

          if (this.conceptData.DAYS_SUPPLY_DISTRIBUTION) {
            this.specDaysSupply.data = {
              values: this.conceptData.DAYS_SUPPLY_DISTRIBUTION,
            };
            this.hasDaysSupply = true;
            embed("#viz-dayssupply", this.specDaysSupply);
          }

          if (this.conceptData.QUANTITY_DISTRIBUTION) {
            this.specQuantity.data = {
              values: this.conceptData.QUANTITY_DISTRIBUTION,
            };
            this.hasQuantity = true;
            embed("#viz-quantity", this.specQuantity);
          }

          if (this.conceptData.AGE_AT_FIRST_OCCURRENCE) {
            this.specAgeAtFirstOccurrence.data = {
              values: this.conceptData.AGE_AT_FIRST_OCCURRENCE,
            };
            this.hasAgeAtFirstOccurrence = true;
            embed(
              "#viz-ageatfirstoccurrence",
              this.specAgeAtFirstOccurrence
            ).then(() => {
              window.dispatchEvent(new Event("resize"));
            });
          }

          if (this.conceptData.VISIT_DURATION_BY_TYPE) {
            this.specVisitDurationByType.data = {
              values: this.conceptData.VISIT_DURATION_BY_TYPE,
            };
            this.hasVisitDurationByType = true;
            embed(
              "#viz-visitdurationbytype",
              this.specVisitDurationByType
            ).then(() => {
              window.dispatchEvent(new Event("resize"));
            });
          }

          if (this.conceptData.CONDITIONS_BY_TYPE) {
            this.specConditionsByType.data = {
              values: this.conceptData.CONDITIONS_BY_TYPE,
            };
            this.hasConditionsByType = true;
            embed("#viz-conditionsbytype", this.specConditionsByType).then(
              () => {
                window.dispatchEvent(new Event("resize"));
              }
            );
          }

          if (this.conceptData.DRUGS_BY_TYPE) {
            this.specDrugsByType.data = {
              values: this.conceptData.DRUGS_BY_TYPE,
            };
            this.hasDrugsByType = true;
            embed("#viz-drugsbytype", this.specDrugsByType);
          }

          if (this.conceptData.RECORDS_BY_UNIT) {
            this.specRecordsByUnit.data = {
              values: this.conceptData.RECORDS_BY_UNIT,
            };
            this.hasRecordsByUnit = true;
            embed("#viz-recordsbyunit", this.specRecordsByUnit);
          }

          if (this.conceptData.MEASUREMENTS_BY_TYPE) {
            this.specMeasurementsByType.data = {
              values: this.conceptData.MEASUREMENTS_BY_TYPE,
            };
            this.hasMeasurementsByType = true;
            embed("#viz-measurementsbytype", this.specMeasurementsByType);
          }

          if (this.conceptData.AGE_AT_FIRST_EXPOSURE) {
            this.specAgeAtFirstExposure.data = {
              values: this.conceptData.AGE_AT_FIRST_EXPOSURE,
            };
            this.hasAgeAtFirstExposure = true;
            embed("#viz-ageatfirstexposure", this.specAgeAtFirstExposure).then(
              () => {
                window.dispatchEvent(new Event("resize"));
              }
            );
          }

          if (this.conceptData.AGE_AT_FIRST_DIAGNOSIS) {
            this.specAgeAtFirstDiagnosis.data = {
              values: this.conceptData.AGE_AT_FIRST_DIAGNOSIS,
            };
            this.hasAgeAtFirstDiagnosis = true;
            embed(
              "#viz-ageatfirstdiagnosis",
              this.specAgeAtFirstDiagnosis
            ).then(() => {
              window.dispatchEvent(new Event("resize"));
            });
          }

          this.specRecordProportionByAgeSexYear.data = {
            values: dataService.sortByRange(
              this.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR,
              "ascending",
              "TRELLIS_NAME",
              "trellisOrder"
            ),
          };
          this.specRecordProportionByMonth.data = {
            values: this.conceptData.PREVALENCE_BY_MONTH,
          };

          if (
            this.conceptData.MEASUREMENT_VALUE_DISTRIBUTION &&
            this.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.length > 0
          ) {
            this.specMeasurementValueDistribution.data = {
              values: this.conceptData.MEASUREMENT_VALUE_DISTRIBUTION,
            };
            this.hasMeasurementValueDistribution = true;
            embed(
              "#viz-measurementvaluedistribution",
              this.specMeasurementValueDistribution
            ).then(() => {
              window.dispatchEvent(new Event("resize"));
            });
          }

          this.conceptData.PREVALENCE_BY_MONTH.forEach((v, i) => {
            this.conceptData.PREVALENCE_BY_MONTH[i].date = dateParse(
              v.X_CALENDAR_MONTH
            );
          });

          embed(
            "#viz-recordproportionbymonth",
            this.specRecordProportionByMonth
          ).then(() => {
            window.dispatchEvent(new Event("resize"));
          });

          embed(
            "#viz-recordproportionbyagesexyear",
            this.specRecordProportionByAgeSexYear
          ).then(() => {
            window.dispatchEvent(new Event("resize"));
          });

          this.dataLoaded = true;
        })
        .catch((err) => {
          this.componentFailed = true;
          this.errorText = "Failed to obtain concept summary data file.";
          this.errorDetails = err + " (" + dataUrl + ") ";
        });
    },
  },
  computed: {},
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
