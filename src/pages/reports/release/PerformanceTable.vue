<template>
  <div>
    <v-container v-if="dataInStore && !getErrors" fluid class="pa-1">
      <v-card elevation="10" class="ma-4 pa-2">
        <v-card-title>Performance</v-card-title>
        <v-row>
          <v-col cols="3">
            <v-text-field
              v-model="search"
              prepend-icon="mdi-magnify"
              label="Search in Table"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="9"> </v-col>
        </v-row>

        <v-data-table
          class="mt-4"
          dense
          :headers="headers"
          :items="filteredRecords"
          :footer-props="{
            'items-per-page-options': [10, 50, 100],
          }"
          item-key="CONCEPT_ID"
          :items-per-page="10"
          :search="search"
        >
          <template v-slot:body.prepend>
            <tr>
              <th v-for="header in headers" :key="header.text">
                <div v-if="filters.hasOwnProperty(header.value)">
                  <v-select
                    v-model="filters[header.value]"
                    small-chips
                    deletable-chips
                    hide-details
                    multiple
                    :items="getValuesArray(getData.domainTable, header.value)"
                  ></v-select>
                </div>
              </th>
            </tr>
          </template>
          <template v-slot:item.analysis_id="{ item }">
            <v-layout justify-end
              ><a
                target="_new"
                :href="getSqlQueryLink(`analyses/${item.analysis_id}.sql`)"
                >{{ item.analysis_id }}</a
              ></v-layout
            >
          </template>
          <template v-slot:item.elapsed_seconds="{ item }">
            <v-layout justify-end>{{ item.elapsed_seconds }}</v-layout>
          </template>
        </v-data-table>

        <info-panel
          details="This report
          describes how long each analysis executed during Achilles characterization took to run in seconds."
          :link="getAchillesLink"
        >
        </info-panel>

        <info-panel
          v-if="getQueryIndex"
          icon="mdi-code-braces"
          details="View export query."
          :link-details="true"
          :link="getSqlQueryLink(getQueryIndex.ACHILLES_PERFORMANCE[0])"
          :divider="false"
        ></info-panel>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getLinks } from "@/shared/config/links";
import infoPanel from "@/widgets/infoPanel";
import { mixins } from "@/shared/lib/mixins";

export default {
  components: { infoPanel },
  mixins: [mixins, getLinks],
  props: {
    resultFile: String,
  },
  data: function () {
    return {
      chooseHeaderMenu: false,
      search: "",
      filters: {},
      headers: [
        {
          text: "Analysis Id",
          sortable: true,
          value: "analysis_id",
        },
        {
          text: "Analysis Name",
          sortable: true,
          value: "analysis_name",
        },
        {
          text: "Duration (seconds)",
          sortable: true,
          value: "elapsed_seconds",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
    filteredRecords() {
      return this.getData.domainTable.filter((d) => {
        return Object.keys(this.filters).every((f) => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    },
  },
};
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
