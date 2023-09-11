<template>
  <v-card
    :loading="!store.getters.getData.cdmsourceData"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="CDM Source Details" />
    <v-container v-if="store.getters.getData.cdmsourceData" fluid>
      <v-layout
        v-for="(d, i) in store.getters.getData.cdmsourceData.columns"
        :key="i"
        class="pl-8"
      >
        {{ d }}: {{ store.getters.getData.cdmsourceData[0][d] }}
      </v-layout>
    </v-container>
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="CDM Source
        Details are derived from the CDM_SOURCE table."
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
</script>

<style scoped></style>
