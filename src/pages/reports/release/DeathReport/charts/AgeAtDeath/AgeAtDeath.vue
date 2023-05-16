<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatdeath"
      width="100"
      title="Age at Death"
      :config="specAgeAtDeath"
      :data="store.getters.getData.AGE_AT_DEATH"
    />
    <infopanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.name.toUpperCase()].AGE_AT_DEATH[0]
        )
      "
      :divider="true"
    ></infopanel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specAgeAtDeath } from "./specAgeAtDeath";
import { links } from "@/shared/config/links";
import Infopanel from "@/widgets/infoPanel";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
