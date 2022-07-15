<template>
  <v-container fluid>
    <v-card>
      <Pivot
        :data="getData['networkPerformance']"
        :attributes="[
          'TASK',
          'TIMING',
          'PACKAGE',
          'CATEGORY',
          'SOURCE',
          'RELEASE',
        ]"
      />
    </v-card>
  </v-container>
</template>

<script>
import Pivot from "@/interface/components/Pivot/Pivot";
import { mapGetters } from "vuex";
export default {
  name: "NetworkPerformance",
  components: { Pivot },
  computed: {
    ...mapGetters(["getData"]),
  },
  methods: {},
};
</script>

<style scoped></style>
