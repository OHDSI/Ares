<template>
  <Panel header="CDM Source Details">
    <div
      class="flex flex-col gap-2 p-5"
      v-if="store.getters.getData.cdmsourceData"
    >
      <div
        v-for="(value, key) in store.getters.getData.cdmsourceData[0]"
        :key="key"
      >
        <span class="font-bold">{{ formatKey(key) }}</span
        >: {{ value }}
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
          @iconClicked="
            openNewTab(
              links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import ChartActionIcon from "@/shared/ui/toggleIcon";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import { openNewTab } from "@/shared/lib/utils";

const store = useStore();

function formatKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
</script>

<style scoped></style>
