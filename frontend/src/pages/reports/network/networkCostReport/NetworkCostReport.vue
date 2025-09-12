<template>
  <Panel header="Network Cost Index">
    <DataTable
      v-if="data"
      :striped-rows="store.getters.getSettings.strippedRows"
      removable-sort
      size="small"
      :value="data"
    >
      <Column header="Source" field="SOURCE">
        <template #body="slotProps">
          <router-link
            class="text-blue-400 hover:underline"
            :to="redirectToPage(slotProps.data)"
            :title="slotProps.data.SOURCE"
          >
            {{ slotProps.data.SOURCE }}
          </router-link>
        </template>
      </Column>
      <Column header="Latest Release" field="LATEST_RELEASE">
        <template #body="slotProps">
          <router-link
            class="text-blue-400 hover:underline"
            :to="redirectToPage(slotProps.data)"
            :title="slotProps.data.LATEST_RELEASE"
          >
            {{ slotProps.data.LATEST_RELEASE }}
          </router-link>
        </template>
      </Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        header="Total Cost"
        field="TOTAL_COST"
      >
        <template #body="slotProps">
          {{
            parseFloat(slotProps.data.TOTAL_COST) &&
            !isNaN(parseFloat(slotProps.data.TOTAL_COST))
              ? `${isoToSymbol(slotProps.data.CURRENCY_CODE)} ${formatComma(
                  slotProps.data.TOTAL_COST
                )}`
              : "No data"
          }}
        </template>
      </Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        header="Total Paid"
        field="TOTAL_CHARGE"
      >
        <template #body="slotProps">
          {{
            parseFloat(slotProps.data.TOTAL_COST) &&
            !isNaN(parseFloat(slotProps.data.TOTAL_COST))
              ? `${isoToSymbol(slotProps.data.CURRENCY_CODE)} ${formatComma(
                  slotProps.data.TOTAL_COST
                )}`
              : "No data"
          }}
        </template>
      </Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        header="Total Charge"
        field="TOTAL_PAID"
      >
        <template #body="slotProps">
          {{
            parseFloat(slotProps.data.TOTAL_COST) &&
            !isNaN(parseFloat(slotProps.data.TOTAL_COST))
              ? `${isoToSymbol(slotProps.data.CURRENCY_CODE)} ${formatComma(
                  slotProps.data.TOTAL_COST
                )}`
              : "No data"
          }}
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { computed } from "vue";
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";

const store = useStore();

const data = computed(() => store.getters.getData.networkCostIndex);

function isoToSymbol(code) {
  if (!code) return "$";
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
  });
  return formatter.format(0).replace(/\d|[.,\s]/g, "");
}

function redirectToPage(data) {
  return {
    name: "costTable",
    params: {
      cdm: data.SOURCE,
      release: data.LATEST_RELEASE,
    },
  };
}
</script>

<style scoped></style>
