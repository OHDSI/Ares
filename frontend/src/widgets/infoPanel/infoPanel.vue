<template>
  <div class="flex flex-row gap-36 px-5">
    <div v-if="props.concept" class="flex flex-col items-center">
      <div class="flex flex-row items-center content-center">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiIdentifier"
        ></svg-icon>
        <Badge severity="info" :value="props.concept" />
      </div>
      <p class="font-light text-xs dark:text-white">Concept Identifier</p>
    </div>
    <div v-if="props.domain" class="flex flex-col items-center">
      <div class="flex flex-row items-center content-center">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiTableRow"
        ></svg-icon>
        <Badge
          severity="info"
          :value="props.domain.split('_').join(' ').toUpperCase()"
        />
      </div>
      <p class="font-light text-xs dark:text-white">Domain ID</p>
    </div>
    <div v-if="props.population" class="flex flex-col items-center">
      <div class="flex flex-row items-center content-center">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiAccountGroup"
        ></svg-icon>
        <Badge severity="info" :value="formatComma(props.population)" />
      </div>
      <p class="font-light text-xs dark:text-white">Number of People</p>
    </div>
    <div v-if="props.percentPeople" class="flex flex-col items-center">
      <div class="flex flex-row items-center content-center">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiPercent"
        ></svg-icon>
        <Badge
          severity="info"
          :value="formatPercent(props.percentPeople)"
        />
      </div>
      <p class="font-light text-xs dark:text-white">% of People</p>
    </div>
    <div v-if="props.recordsPerPerson" class="flex flex-col items-center">
      <div class="flex flex-row items-center content-center">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiTableRow"
        ></svg-icon>
        <Badge severity="info" :value="props.recordsPerPerson" />
      </div>
      <p class="font-light text-xs dark:text-white">Records per Person</p>
    </div>
    <div
      v-if="props.percentValues"
      class="flex flex-col items-center content-center"
    >
      <div class="flex flex-row">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiDatabaseCheckOutline"
        ></svg-icon>
        <Badge severity="info" :value="props.percentValues" />
      </div>
      <p class="font-light text-xs dark:text-white">% with Values</p>
    </div>
    <div
      v-if="props.countFailed"
      class="flex flex-col items-center content-center"
    >
      <div @click="props.countFailed.action" class="flex flex-row">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiDatabaseAlert"
        ></svg-icon>
        <Badge severity="danger" :value="props.countFailed.value" />
      </div>
      <p class="font-light text-xs dark:text-white">Records Per Person</p>
    </div>
    <div
      v-if="props.notStationary"
      class="flex flex-col items-center content-center"
    >
      <div class="flex flex-row">
        <svg-icon
          class="text-red-500"
          type="mdi"
          :path="mdiClockAlert"
        ></svg-icon>
      </div>
      <p class="font-light text-xs dark:text-white">
        Non-Stationary Time Series
      </p>
    </div>
    <div
      v-if="props.proportionSex"
      class="flex flex-col items-center content-center"
    >
      <div class="flex flex-row">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiHumanMaleFemale"
        ></svg-icon>
        <div class="flex flex-row gap-2">
          <Badge
            severity="info"
            :value="
              'Male: ' +
              formatComma(props.proportionSex.male.count) +
              ' (' +
              formatPercent(props.proportionSex.male.pct) +
              ')'
            "
          />
          <Badge
            severity="info"
            :value="
              'Female: ' +
              formatComma(props.proportionSex.female.count) +
              ' (' +
              formatPercent(props.proportionSex.female.pct) +
              ')'
            "
          />
        </div>
      </div>
      <p class="font-light text-xs dark:text-white">Proportion by Sex</p>
    </div>
    <div
      v-if="props.networkPopulation"
      class="flex flex-col items-center content-center"
    >
      <div class="flex flex-row">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiAccountGroup"
        ></svg-icon>
        <Badge severity="info" :value="props.networkPopulation" />
      </div>
      <p class="font-light text-xs dark:text-white">
        Number of People in Network
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from "@/shared/ui/SvgIcon.vue";
import {
  mdiAccountGroup,
  mdiClockAlert,
  mdiDatabaseAlert,
  mdiDatabaseCheckOutline,
  mdiHumanMaleFemale,
  mdiIdentifier,
  mdiPercent,
  mdiTableRow,
} from "@mdi/js";
import Badge from "primevue/badge";
import { formatComma, formatPercent } from "@/shared/lib/formatters";

interface Props {
  population?: number;
  domain?: string;
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
