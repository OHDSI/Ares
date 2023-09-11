<template>
  <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
    <ChartHeader title="Death By Type" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-deathbytype"
      width="100"
      :chartSpec="specDeathByType"
      :data="store.getters.getData.DEATH_BY_TYPE"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.name.toUpperCase()]
                .DEATH_BY_TYPE[0]
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specDeathByType } from "./specDeathByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
