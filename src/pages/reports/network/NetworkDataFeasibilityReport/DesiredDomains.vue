<template>
  <v-container fluid>
    <v-data-table
      class="mb-4"
      dense
      :hide-default-footer="true"
      :disable-pagination="true"
      :headers="getDomainHeaders"
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
        ></v-select>
      </template>
      <template v-slot:item.condition_occurrence.data="{ item }">{{
        item.condition_occurrence.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.drug_exposure.data="{ item }">{{
        item.drug_exposure.data ? "Yes" : "No"
      }}</template
      ><template v-slot:item.device_exposure.data="{ item }">{{
        item.device_exposure.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.measurement.data="{ item }">{{
        item.measurement.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.death.data="{ item }">{{
        item.death.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.procedure_occurrence.data="{ item }">{{
        item.procedure_occurrence.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.observation_period.data="{ item }">{{
        item.observation_period.data ? "Yes" : "No"
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert color="grey darken-3" dark dense icon="mdi-help-rhombus" prominent>
      This section shows data availability for chosen domains.
    </v-alert>
  </v-container>
</template>

<script>
import * as d3Format from "d3-format";

export default {
  name: "DesiredDomains",
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
        { value: "observation_period", text: "Observation" },
      ],
      domainMap: {
        condition_occurrence: "1000000",
        drug_exposure: "0100000",
        device_exposure: "0010000",
        measurement: "0001000",
        death: "0000100",
        procedure_occurrence: "0000010",
        observation_period: "0000001",
      },
    };
  },
  computed: {
    getDesiredDomainsOverview: function () {
      if (this.switchDomains.length && this.getDomainsData.length) {
        return this.getDomainsData.map((value) => ({
          cdm_name: value.cdm_name,
          allDomainsPresent:
            Object.values(value).filter((domain) => domain.data && domain.show)
              .length === this.switchDomains.length,
        }));
      } else {
        return [];
      }
    },
    getDomainsData: function () {
      if (this.switchDomains.length) {
        return this.data.map((value) => ({
          cdm_name: value.source,
          condition_occurrence: {
            data: value.data.filter(
              (bits) => this.domainMap.condition_occurrence === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("condition_occurrence"),
          },
          drug_exposure: {
            data: value.data.filter(
              (bits) => this.domainMap.drug_exposure === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("drug_exposure"),
          },
          device_exposure: {
            data: value.data.filter(
              (bits) => this.domainMap.device_exposure === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("device_exposure"),
          },
          measurement: {
            data: value.data.filter(
              (bits) => this.domainMap.measurement === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("measurement"),
          },
          death: {
            data: value.data.filter(
              (bits) => this.domainMap.death === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("death"),
          },
          procedure_occurrence: {
            data: value.data.filter(
              (bits) => this.domainMap.procedure_occurrence === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("procedure_occurrence"),
          },
          observation_period: {
            data: value.data.filter(
              (bits) => this.domainMap.observation_period === bits.DOMAIN_BITS
            )[0]?.COUNT_VALUE,

            show: this.switchDomains.includes("observation_period"),
          },
        }));
      } else {
        return [];
      }
    },
    getDomainHeaders: function () {
      return [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "cdm_name",
          show: true,
        },
        {
          text: "Condition Occurrence",
          align: "start",
          sortable: false,
          value: "condition_occurrence.data",
          show: this.getDomainsData[0]?.condition_occurrence.show,
        },
        {
          text: "Drug Exposure",
          align: "start",
          sortable: false,
          value: "drug_exposure.data",
          show: this.getDomainsData[0]?.drug_exposure.show,
        },
        {
          text: "Device Exposure",
          align: "start",
          sortable: false,
          value: "device_exposure.data",
          show: this.getDomainsData[0]?.device_exposure.show,
        },
        {
          text: "Measurement",
          align: "start",
          sortable: false,
          value: "measurement.data",
          show: this.getDomainsData[0]?.measurement.show,
        },
        {
          text: "Death",
          align: "start",
          sortable: false,
          value: "death.data",
          show: this.getDomainsData[0]?.death.show,
        },
        {
          text: "Procedure Occurrence",
          align: "start",
          sortable: false,
          value: "procedure_occurrence.data",
          show: this.getDomainsData[0]?.procedure_occurrence.show,
        },
        {
          text: "Observation",
          align: "start",
          sortable: false,
          value: "observation_period.data",
          show: this.getDomainsData[0]?.observation_period.show,
        },
      ].filter((x) => x.show);
    },
  },
  watch: {
    getDesiredDomainsOverview: function () {
      this.$emit("desiredDomainsDataChanged", this.getDesiredDomainsOverview);
    },
  },
  methods: {
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
  },
};
</script>

<style scoped></style>
