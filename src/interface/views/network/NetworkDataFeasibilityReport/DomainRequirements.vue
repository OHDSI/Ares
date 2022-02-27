<template>
  <v-container>
    <v-data-table
      class="mb-4"
      dense
      :hide-default-footer="true"
      :disable-pagination="true"
      :headers="domainHeaders"
      :items="getDomainsData"
    >
      <template v-slot:top>
        <v-select
          v-model="switchDomains"
          :items="items"
          chips
          label="Select domains"
          deletable-chips
          multiple
          hide-selected
          @change="updateBits"
        ></v-select>
      </template>
      <template v-slot:item.percentage="{ item }">{{
        (item.percentage * 100).toFixed(2)
      }}</template>
      <template v-slot:item.population="{ item }">{{
        formatComma(item.population)
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert color="grey darken-3" dark dense icon="mdi-help-rhombus" prominent>
      This section uses pre-calculated data to display % of overlapping values
    </v-alert>
  </v-container>
</template>

<script>
import * as d3Format from "d3-format";

export default {
  name: "DomainRequirements",
  props: {
    data: Array,
  },
  data() {
    return {
      switchDomains: [],
      items: [
        { value: "condition_occurrence", text: "Condition occurrence" },
        { value: "drug_exposure", text: "Drug exposure" },
        { value: "device_exposure", text: "Device exposure" },
        { value: "measurement", text: "Measurement" },
        { value: "death", text: "Death" },
        { value: "procedure_occurrence", text: "Procedure occurrence" },
        { value: "observation_period", text: "Observation period" },
      ],
      domainBits: "0000000",
      domainHeaders: [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "cdm_name",
        },
        {
          text: "Person Count",
          value: "population",
          align: "end",
        },
        {
          text: "%",
          value: "percentage",
          align: "end",
        },
      ],
    };
  },
  computed: {
    getDomainsData: function () {
      if (this.domainBits === "0000000") {
        return [];
      } else {
        return this.data.map((value) => {
          const data = value.data.filter(
            (d) => d.DOMAIN_BITS === this.domainBits
          );
          return {
            cdm_name: value.source,
            percentage: data[0]?.PERCENT_VALUE,
            population: data[0]?.COUNT_VALUE,
          };
        });
      }
    },
  },
  watch: {
    getDomainsData: function () {
      this.$emit("domainsDataChanged", this.getDomainsData);
    },
  },
  methods: {
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
    updateBits: function () {
      this.domainBits = "";
      this.domainBits = this.domainBits.concat(
        this.switchDomains.includes("condition_occurrence") ? "1" : "0",
        this.switchDomains.includes("drug_exposure") ? "1" : "0",
        this.switchDomains.includes("device_exposure") ? "1" : "0",
        this.switchDomains.includes("measurement") ? "1" : "0",
        this.switchDomains.includes("death") ? "1" : "0",
        this.switchDomains.includes("procedure_occurrence") ? "1" : "0",
        this.switchDomains.includes("observation_period") ? "1" : "0"
      );
    },
  },
};
</script>

<style scoped></style>
