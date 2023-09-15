<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Performance" />
    <v-row>
      <v-col cols="3">
        <v-text-field
          v-model="search"
          prepend-icon="mdi-magnify"
          label="Search in Table"
          single-line
          variant="outlined"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="9"> </v-col>
    </v-row>

    <v-data-table
      class="mt-4"
      density="compact"
      :headers="headers"
      :items="filteredRecords"
      :footer-props="{
        'items-per-page-options': [10, 50, 100],
      }"
      item-key="CONCEPT_ID"
      :items-per-page="10"
      :search="search"
    >
      <template #body.prepend>
        <tr>
          <th v-for="header in headers" :key="header.title">
            <div v-if="filters.hasOwnProperty(header.key)">
              <v-select
                v-model="filters[header.key]"
                small-chips
                deletable-chips
                hide-details
                multiple
                :items="
                  helpers.getValuesArray(
                    store.getters.getData.domainTable,
                    header.key
                  )
                "
              ></v-select>
            </div>
          </th>
        </tr>
      </template>
      <template #item.analysis_id="{ item }">
        <v-layout justify-end
          ><a
            target="_new"
            :href="
              links.getSqlQueryLink(`analyses/${item.raw.analysis_id}.sql`)
            "
            >{{ item.raw.analysis_id }}</a
          ></v-layout
        >
      </template>
      <template #item.elapsed_seconds="{ item }">
        <v-layout justify-end>{{ item.raw.elapsed_seconds }}</v-layout>
      </template>
    </v-data-table>

    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Proportion of people with at least one record per 1000 people."
      />
      <ChartActionIcon
        icon="mdi-open-in-new"
        tooltip="This report
          describes how long each analysis executed during Achilles characterization took to run in seconds."
        @iconClicked="helpers.openNewTab(links.getAchillesLink())"
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.ACHILLES_PERFORMANCE[0]
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
import { ref, computed } from "vue";
import { useStore } from "vuex";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();

const search = ref("");
const filters = ref({});
const headers = ref([
  {
    title: "Analysis Id",
    sortable: true,
    key: "analysis_id",
  },
  {
    title: "Analysis Name",
    sortable: true,
    key: "analysis_name",
  },
  {
    title: "Duration (seconds)",
    sortable: true,
    key: "elapsed_seconds",
  },
]);

const filteredRecords = computed(function () {
  return store.getters.getData.domainTable.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters].length < 1 ||
        filters.value[f as keyof typeof filters].includes(d[f])
      );
    });
  });
});
</script>

<style scoped></style>
