<template>
  <div class="flex flex-row gap-12 px-5">
    <div v-if="props.concept" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-primary-500" type="mdi" :path="mdiIdentifier" />
        <span class="text-lg font-semibold text-primary-500">{{
          props.concept
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Concept Identifier
      </p>
    </div>

    <div v-if="props.domain" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-primary-500" type="mdi" :path="mdiTableRow" />
        <span class="text-lg font-semibold text-primary-500">
          {{ props.domain.split("_").join(" ").toUpperCase() }}
        </span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Domain ID
      </p>
    </div>

    <div v-if="props.population" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-primary-500" type="mdi" :path="mdiAccountGroup" />
        <span class="text-lg font-semibold text-primary-500">{{
          formatComma(props.population)
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Number of People
      </p>
    </div>

    <div v-if="props.percentPeople" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-primary-500" type="mdi" :path="mdiPercent" />
        <span class="text-lg font-semibold text-primary-500">{{
          formatPercent(props.percentPeople)
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        % of People
      </p>
    </div>

    <div v-if="props.recordsPerPerson" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-primary-500" type="mdi" :path="mdiTableRow" />
        <span class="text-lg font-semibold text-primary-500">{{
          props.recordsPerPerson
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Records per Person
      </p>
    </div>

    <div v-if="props.percentValues" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiDatabaseCheckOutline"
        />
        <span class="text-lg font-semibold text-primary-500">{{
          props.percentValues
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        % with Values
      </p>
    </div>

    <div
      v-if="props.countFailed"
      class="flex flex-col items-center"
      @click="props.countFailed.action"
    >
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-red-500" type="mdi" :path="mdiDatabaseAlert" />
        <span class="text-lg font-semibold text-red-500">{{
          props.countFailed.value
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Records Per Person
      </p>
    </div>

    <div v-if="props.notStationary" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-red-500" type="mdi" :path="mdiClockAlert" />
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Non-Stationary Time Series
      </p>
    </div>

    <div v-if="props.proportionSex" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiHumanMaleFemale"
        />
        <span class="text-lg font-semibold text-primary-500">
          {{ formatComma(props.proportionSex.male.count) }} M
          <span class="text-sm font-normal" :style="{ color: mutedColor }">{{
            formatPercent(props.proportionSex.male.pct)
          }}</span>
          &nbsp;·&nbsp;
          {{ formatComma(props.proportionSex.female.count) }} F
          <span class="text-sm font-normal" :style="{ color: mutedColor }">{{
            formatPercent(props.proportionSex.female.pct)
          }}</span>
        </span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Proportion by Sex
      </p>
    </div>

    <div v-if="props.networkPopulation" class="flex flex-col items-center">
      <div class="flex flex-col items-center gap-0.5">
        <svg-icon class="text-primary-500" type="mdi" :path="mdiAccountGroup" />
        <span class="text-lg font-semibold text-primary-500">{{
          props.networkPopulation
        }}</span>
      </div>
      <p class="text-xs mt-0.5 text-center" :style="{ color: mutedColor }">
        Number of People in Network
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import SvgIcon from "@/shared/ui/svgIcon";
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
import { formatComma, formatPercent } from "@/shared/lib/formatters";

interface Props {
  population?: number;
  domain?: string;
  concept?: string;
  percentPeople?: number;
  recordsPerPerson?: string;
  percentValues?: string;
  proportionSex?: {
    male: { count: number; pct: number };
    female: { count: number; pct: number };
  };
  countFailed?: { value: string; action: () => void };
  notStationary?: boolean;
  networkPopulation?: number;
  networkConceptReport?: () => void;
}

const props = defineProps<Props>();

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const mutedColor = computed(() => (darkMode.value ? "#9ca3af" : "#94a3b8"));
</script>

<style scoped></style>
