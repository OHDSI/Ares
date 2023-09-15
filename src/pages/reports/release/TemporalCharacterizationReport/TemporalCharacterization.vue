<template>
  <v-card v-if="store.getters.dataInStore" elevation="2" class="ma-4">
    <ChartHeader title="Temporal Characterization" />
    <!--Table controls-->
    <v-row>
      <v-col cols="3">
        <v-text-field
          prepend-icon="mdi-magnify"
          label="Search in Table"
          single-line
          hide-details
          variant="outlined"
          v-model="search"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
      class="mt-4"
      :headers="headers"
      :items="filteredChecks"
      :footer-props="{
        'items-per-page-options': [5, 10, 25],
      }"
      item-key="checkId"
      :items-per-page="10"
      :search="search"
      density="compact"
    >
      <template v-slot:item.CONCEPT_ID="{ item }">
        <v-layout flex-end
          ><router-link :to="getReportRoute(item.raw)">{{
            item.raw.CONCEPT_ID
          }}</router-link></v-layout
        >
      </template>
      <template v-slot:item.CONCEPT_NAME="{ item }">
        <v-row>
          <v-col cols="10">
            <router-link
              :to="getReportRoute(item.raw)"
              :title="item.raw.CONCEPT_NAME"
              >{{ item.raw.CONCEPT_NAME }}
            </router-link>
          </v-col>
        </v-row>
      </template>
      <template v-slot:body.prepend>
        <tr>
          <th v-for="header in headers" :key="header.title">
            <div
              v-if="
                header.title === 'Table' || header.title === 'Is Stationary'
              "
            >
              <v-select
                v-model="filters[header.value]"
                prepend-inner-icon="mdi-filter"
                small-chips
                deletable-chips
                hide-details
                multiple
                :items="helpers.getValuesArray(filteredChecks, header.value)"
              ></v-select>
            </div>
          </th>
        </tr>
      </template>
    </v-data-table>
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="
          store.getters.getQueryIndex &&
          store.getters.getQueryIndex.TEMPORAL_CHARACTERIZATION
        "
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.TEMPORAL_CHARACTERIZATION[0]
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import { computed, ref, Ref } from "vue";
import { useStore } from "vuex";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();

const search = ref("");
const filters = ref({
  CDM_TABLE_NAME: [],
  IS_STATIONARY: [],
});
const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Table",
    sortable: false,
    key: "CDM_TABLE_NAME",
  },
  {
    title: "Concept id",
    sortable: false,
    key: "CONCEPT_ID",
  },
  {
    title: "Concept Name",
    sortable: false,
    key: "CONCEPT_NAME",
  },
  {
    title: "Seasonality Score",
    sortable: true,
    key: "SEASONALITY_SCORE",
  },
  {
    title: "Is Stationary",
    sortable: true,
    key: "IS_STATIONARY",
  },
]);

const filteredChecks = computed(function () {
  return store.getters.getData.temporalCharacterization.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters].length < 1 ||
        filters.value[f as keyof typeof filters].includes(d[f])
      );
    });
  });
});

function getReportRoute(item: {
  CDM_TABLE_NAME: string;
  CONCEPT_ID: string | number;
}) {
  return {
    name: "concept",
    params: {
      domain: item.CDM_TABLE_NAME.toLowerCase(),
      concept: item.CONCEPT_ID,
    },
  };
}
</script>

<style scoped></style>
