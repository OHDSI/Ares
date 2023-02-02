<template>
  <v-container fluid>
    <v-card elevation="10" class="ma-4 pa-2">
      <div class="text-h4 pl-4 pr-4 pt-4">
        A data ingestion analysis of COVID-19 vaccine related source data.
      </div>
      <div class="text-caption pl-4 pt-2 pr-4">C.Blacketer, F.DeFalco</div>
      <div class="article pl-4 pr-4">
        <div class="text-h6 mt-4">Background</div>
        COVID-19 as a global pandemic is testing the ability of the world's
        researchers to understand the impact of the disease as well as the
        efficacy and safety of the vaccines intended to prevent its spread. Real
        world data is being leveraged to aid in the efforts to track post
        marketing safety surveillence. In order to fully understand the nature
        of the rapidly evolving methods for identifying the vaccine information
        in real world evidence this paper evaluates a network of observational
        data sources for data elements and their likely mappings to the eventual
        data standards that can be reliably leveraged to extract research
        quality evidence from real world data sources.
        <div class="text-h6 mt-4">Methods</div>
        Queries were developed to expose the internal mappings of source values
        to their standardized concepts and further to the manufacturer.
        <div class="text-h6 mt-4">Results</div>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import * as d3Import from "d3-dsv";
export default {
  data: function () {
    return {
      chartOptions: {
        width: 1000,
        height: 10000,
        tooltip: {
          isHtml: false,
          textStyle: {
            fontName: "Georgia",
            fontSize: 12,
          },
        },
        sankey: {
          node: {
            width: 20,
          },
          interactivity: true,
          link: {},
        },
      },
      chartData: [],
    };
  },
  created() {
    const vm = this;
    const dataUrl = "sankeyData.csv";
    axios.get(dataUrl).then((response) => {
      const data = d3Import.tsvParseRows(response.data, function (d, i) {
        if (i == 0) {
          return [d[0], d[1], d[2]];
        } else {
          return [d[0], d[1], +d[2]];
        }
      });
      vm.chartData = data;
    });
  },
  methods: {
    onChartReady() {},
  },
};
</script>

<style scoped>
.v-card__title {
  word-break: keep-all;
  font-family: Georgia, "Times New Roman", Times, serif;
}
div.article {
  word-break: keep-all;
  font-family: Georgia, "Times New Roman", Times, serif;
  line-height: 2;
}
</style>
