<template>
  <v-card
    v-if="store.getters.getData.conceptData.QUANTITY_DISTRIBUTION"
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="Quantity" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-quantity"
      :chartSpec="specQuantity"
      :data="store.getters.getData.conceptData.QUANTITY_DISTRIBUTION"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Learn how
              to interpret this plot."
        @iconClicked="router.push({ name: 'help' })"
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                .QUANTITY_DISTRIBUTION[0]
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
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { specQuantity } from "./specQuantity";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
const store = useStore();
const route = useRoute();
const router = useRouter();
</script>

<style scoped></style>
