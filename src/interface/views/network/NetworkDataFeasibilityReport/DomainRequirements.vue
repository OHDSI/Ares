<template>
  <v-card elevation="10" class="ma-4 pa-2">
    <v-card-title>Domain Requirements</v-card-title>
    <p>
      <v-container>
        <v-row>
          <v-col cols="1"></v-col>
          <v-col cols="5">
            <v-switch
              v-model="switchDomains"
              dense
              label="Condition Occurrence"
              color="blue"
              value="condition_occurrence"
              hide-details
              @change="updateBits()"
            ></v-switch>
            <v-switch
              v-model="switchDomains"
              dense
              label="Drug Exposure"
              color="blue"
              value="drug_exposure"
              hide-details
              @change="updateBits()"
            ></v-switch>
            <v-switch
              v-model="switchDomains"
              dense
              label="Device Exposure"
              color="blue"
              value="device_exposure"
              hide-details
              @change="updateBits()"
            ></v-switch>
            <v-switch
              v-model="switchDomains"
              dense
              label="Measurement"
              color="blue"
              value="measurement"
              hide-details
              @change="updateBits()"
            ></v-switch>
            <v-switch
              v-model="switchDomains"
              dense
              label="Death"
              color="blue"
              value="death"
              hide-details
              @change="updateBits()"
            ></v-switch>
            <v-switch
              v-model="switchDomains"
              dense
              label="Procedure Occurrence"
              color="blue"
              value="procedure_occurrence"
              hide-details
              @change="updateBits()"
            ></v-switch>
            <v-switch
              v-model="switchDomains"
              dense
              label="Observation Period"
              color="blue"
              value="observation_period"
              hide-details
              @change="updateBits()"
            ></v-switch>
          </v-col>
          <v-col cols="6">
            <v-data-table
              dense
              :hide-default-footer="true"
              :disable-pagination="true"
              :headers="domainHeaders"
              :items="getDomainsData"
            >
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
      >
    </p>
  </v-card>
</template>

<script>
export default {
  name: "DomainRequirements",
  props: {
    data: Array,
  },
  data() {
    return {
      switchDomains: [],
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
            percentage: data[0].PERCENT_VALUE,
            population: data[0].COUNT_VALUE,
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
