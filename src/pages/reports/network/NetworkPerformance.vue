<template>
  <v-container fluid>
    <v-card>
      <Pivot
        :data="getData['networkPerformance']"
        :attributes="['TASK', 'PACKAGE', 'CATEGORY', 'SOURCE']"
        :defaults="{
          rows: ['SOURCE'],
          columns: ['PACKAGE'],
        }"
        :aggregators="['Sum']"
        :aggregate-attrs="['TIMING']"
      />
    </v-card>
  </v-container>
</template>

<script>
import Pivot from "@/widgets/pivot";
import { mapGetters } from "vuex";
export default {
  name: "NetworkPerformance",
  components: { Pivot },
  computed: {
    ...mapGetters(["getData"]),
  },
};
</script>

<style scoped>
>>> table.pvtTable tbody tr td {
  text-decoration: none;
  cursor: default;
}
</style>
