<template>
  <Panel header="CDM Source Details">
    <div
      class="flex flex-col gap-2 p-5"
      v-if="store.getters.getData.cdmsourceData"
    >
      <div
        v-for="(d, i) in store.getters.getData.cdmsourceData.columns"
        :key="i"
      >
        <span class="font-bold">{{ d }}</span
        >: {{ store.getters.getData.cdmsourceData[0][d] }}
      </div>
    </div>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="CDM Source
                Details are derived from the CDM_SOURCE table."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="helpers.openNewTab(sqlLink)"
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

const store = useStore();

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.CDM_SOURCE[0]
);
</script>

<style scoped></style>
