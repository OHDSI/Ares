<template>
  <v-container fluid
    ><Pivot :data="getData['networkPerformance']"
  /></v-container>
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
