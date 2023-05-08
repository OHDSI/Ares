<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-deathbytype"
      width="100"
      title="Death By Type"
      :config="specDeathByType"
      :data="store.getters.getData.DEATH_BY_TYPE"
    />
    <infopanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.name.toUpperCase()].DEATH_BY_TYPE[0]
        )
      "
      :divider="true"
    ></infopanel>
  </v-card>
</template>

<script setup lang="ts">
import Infopanel from "@/widgets/infoPanel";
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specDeathByType } from "./specDeathByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
