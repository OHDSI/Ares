<template>
  <v-row class="ma-4 align-baseline" justify="start" align="baseline">
    <v-col v-if="props.concept" cols="2">
      <v-icon left color="primary">mdi-identifier</v-icon>
      <v-badge tile inline color="primary" :content="props.concept"></v-badge>
      <p class="text-caption">Concept Identifier</p></v-col
    >
    <v-col v-if="props.population" cols="2">
      <v-icon left color="primary">mdi-account-group</v-icon>
      <v-badge
        tile
        inline
        dark
        color="primary"
        :content="helpers.formatComma(props.population)"
      ></v-badge>
      <p class="text-caption">Number of People</p>
    </v-col>
    <v-col v-if="props.percentPeople" cols="2" align="center">
      <v-icon small left color="primary">mdi-percent</v-icon>
      <v-badge
        tile
        inline
        dark
        color="primary"
        :content="helpers.formatPercent(props.percentPeople)"
      ></v-badge>
      <p class="text-caption">% of People</p>
    </v-col>
    <v-col v-if="props.recordsPerPerson" cols="2" align="center">
      <v-icon left color="primary">mdi-table-row</v-icon>
      <v-badge
        tile
        inline
        dark
        color="primary"
        :content="props.recordsPerPerson"
      ></v-badge>
      <p class="text-caption">Records per Person</p></v-col
    >
    <v-col v-if="props.percentValues" cols="2" align="center">
      <v-icon left color="primary">mdi-database-check-outline</v-icon>
      <v-badge
        tile
        inline
        dark
        color="primary"
        :content="props.percentValues"
      ></v-badge>
      <p class="text-caption">% with Values</p></v-col
    >
    <v-col v-if="props.countFailed" cols="2" align="center">
      <v-icon left color="error" @click="props.countFailed.action"
        >mdi-database-alert</v-icon
      >
      <v-badge
        tile
        inline
        dark
        color="error"
        :content="props.countFailed.value"
      ></v-badge>
      <p class="text-caption">Data Quality Issues</p></v-col
    >
    <v-col v-if="props.notStationary" cols="2" align="center">
      <v-icon left color="error">mdi-clock-alert</v-icon>
      <p class="text-caption">Non-Stationary Time Series</p></v-col
    >
    <!-- Gender breakdown in top bar -->
    <v-col v-if="props.proportionSex" cols="4" align="center">
      <v-icon left color="primary">mdi-human-male-female</v-icon>
      <v-badge
        tile
        inline
        dark
        color="primary"
        :content="
          'Male: ' +
          helpers.formatComma(props.proportionSex.male.count) +
          ' (' +
          helpers.formatPercent(props.proportionSex.male.pct) +
          ')'
        "
      ></v-badge>
      <v-badge
        tile
        inline
        dark
        color="primary"
        :content="
          'Female: ' +
          helpers.formatComma(props.proportionSex.female.count) +
          ' (' +
          helpers.formatPercent(props.proportionSex.female.pct) +
          ')'
        "
      ></v-badge>
      <p class="text-caption">Proportion by Sex</p>
    </v-col>
    <v-col v-if="props.networkPopulation" cols="2" align="center">
      <v-icon left color="info">mdi-account-group</v-icon>
      <v-badge
        tile
        inline
        dark
        color="info"
        :content="props.networkPopulation"
      ></v-badge>
      <p class="text-caption">Number of People in Network</p>
    </v-col>
    <v-col v-if="props.networkConceptReport" cols="2" align="center">
      <v-icon class="btn" @click="props.networkConceptReport()">
        mdi-check-network
      </v-icon>
      <p class="text-caption">See results across the network</p>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { helpers } from "@/shared/lib/mixins";
import { defineProps } from "vue";

interface Props {
  population?: number;
  concept?: string;
  percentPeople?: number;
  recordsPerPerson?: string;
  percentValues?: string;
  proportionSex?: {
    male: {
      count: number;
      pct: number;
    };
    female: {
      count: number;
      pct: number;
    };
  };
  countFailed?: { value: string; action: () => void };
  notStationary?: boolean;
  networkPopulation?: number;
  networkConceptReport?: () => void;
}

const props = defineProps<Props>();
</script>

<style scoped>
.btn:hover {
  opacity: 1;
  transition-duration: 0.5s;
}

.btn {
  opacity: 0.7;
  transition-duration: 0.5s;
}
</style>
