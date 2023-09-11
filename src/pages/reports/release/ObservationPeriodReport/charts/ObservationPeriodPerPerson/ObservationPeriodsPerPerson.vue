<template>
  <v-card
    v-if="store.getters.dataInStore"
    :loading="!store.getters.getData"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="Observation Periods per Person" />
    <v-data-table
      v-if="store.getters.dataInStore"
      class="mt-4"
      density="compact"
      :headers="headers"
      :items="store.getters.getData.personPeriods"
      :footer-props="{
        'items-per-page-options': [5, 10, 25, 50],
      }"
      :items-per-page="5"
      :sort-by="['PERCENT_PEOPLE']"
      :sort-desc="[true, false]"
    >
      <template #item.PERCENT_PEOPLE="{ item }">
        {{ item.raw.PERCENT_PEOPLE }}%
      </template>
      <template #item.COUNT_VALUE="{ item }">
        {{ helpers.formatComma(item.raw.COUNT_VALUE) }}
      </template>
    </v-data-table>
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.OBSERVATION_PERIOD
                .PERSON_PERIODS_DATA[0]
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { links } from "@/shared/config/links";
import { helpers } from "@/shared/lib/mixins";
import { useStore } from "vuex";
import { ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
const store = useStore();

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Number of Observation Periods",
    sortable: true,
    key: "CONCEPT_NAME",
    align: "start",
  },
  {
    title: "Number of People",
    sortable: true,
    key: "COUNT_VALUE",
    align: "end",
  },
  {
    title: "% of People",
    sortable: true,
    key: "PERCENT_PEOPLE",
    align: "end",
  },
]);
</script>

<style scoped></style>
