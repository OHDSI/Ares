<template>
  <div v-if="!getErrors">
    <v-card :loading="!cdmsourceDataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>CDM Source Details</v-card-title>
      <v-container v-if="cdmsourceDataLoaded">
        <v-layout v-for="(d, i) in cdmsourceData.columns" :key="i" class="pl-8">
          {{ d }}: {{ cdmsourceData[0][d] }}
        </v-layout>
      </v-container>
      <v-card-text>
        <v-icon left color="info" small>mdi-help-circle</v-icon>CDM Source
        Details are derived from the CDM_SOURCE table.
      </v-card-text>
    </v-card>

    <v-card :loading="!metadataDataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Metadata</v-card-title>
      <v-container v-if="metadataDataLoaded">
        <v-layout v-for="(m, mi) in metadataData" :key="mi">
          <v-layout
            v-for="(mc, mci) in metadataData.columns"
            :key="mci"
            class="pl-8"
          >
            {{ mc }}: {{ metadataData[mi][mc] }}
          </v-layout>
        </v-layout>
      </v-container>
      <v-card-text>
        <v-icon left color="info" small>mdi-help-circle</v-icon>Metadata is
        derived from the METADATA table.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import * as d3 from "d3-dsv";
import { FETCH_DATA } from "@/data/store/modules/view/actions.type";
import { CDM_SOURCE, METADATA } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";

export default {
  components: {},
  props: {
    resultFile: String,
  },
  data: function () {
    return {
      cdmsourceData: null,
      metadataData: null,
      cdmsourceDataLoaded: false,
      metadataDataLoaded: false,
      dataLoaded: false,
      domainTable: [],
      search: "",
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    getMenuOffset: function () {
      return true;
    },
    columnValueList(val) {
      return this.domainTable.map((d) => d[val]);
    },
    load() {
      this.dataLoaded = false;
      this.cdmsourceDataLoaded = false;
      this.metadataDataLoaded = false;
      this.$store
        .dispatch(FETCH_DATA, {
          files: [
            { name: METADATA, required: true },
            { name: CDM_SOURCE, required: true },
          ],
        })
        .then(() => {
          if (this.getData[METADATA]) {
            this.metadataData = d3.csvParse(this.getData[METADATA]);
            this.metadataDataLoaded = true;
          }
          if (this.getData[CDM_SOURCE]) {
            this.cdmsourceData = d3.csvParse(this.getData[CDM_SOURCE]);
            this.cdmsourceDataLoaded = true;
          }
          this.dataLoaded = true;
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
