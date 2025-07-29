<template>
  <Panel header="Cost Table">
    <template #icons>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiCompareHorizontal"
          :tooltip="'Compare across the network'"
          @iconClicked="compareToOtherSources"
        />
      </div>
    </template>
    <div class="p-5">
      <DataTable
        v-if="data"
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        :value="displayedData"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        v-model:filters="newFilters"
        :globalFilterFields="['CONCEPT_ID', 'CONCEPT_NAME', '']"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex flex-row gap-5">
            <InputGroup unstyled>
              <InputGroupAddon>
                <i class="pi pi-search"></i>
              </InputGroupAddon>
              <InputText
                class="rounded-r-lg"
                style="width: 45rem"
                unstyled
                :value="route.query.search"
                @update:modelValue="debouncedSearch"
                placeholder="Search in Table"
              />
            </InputGroup>
            <Dropdown :options="domains" v-model="selectedDomain" />
          </div>
        </template>
        <Column field="CONCEPT_ID" header="Concept ID"> </Column>
        <Column field="CONCEPT_NAME" header="Concept Name"> </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="TOTAL_COST"
          header="Total Cost"
        >
          <template #body="slotProps">
            {{
              parseFloat(slotProps.data.TOTAL_COST) &&
              !isNaN(parseFloat(slotProps.data.TOTAL_COST))
                ? `$ ${formatComma(slotProps.data.TOTAL_COST)}`
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="TOTAL_PAID"
          header="Total Paid"
        >
          <template #body="slotProps">
            {{
              parseFloat(slotProps.data.TOTAL_PAID) &&
              !isNaN(parseFloat(slotProps.data.TOTAL_PAID))
                ? `$ ${formatComma(slotProps.data.TOTAL_PAID)}`
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="TOTAL_CHARGE"
          header="Total Charge"
        >
          <template #body="slotProps">
            {{
              parseFloat(slotProps.data.TOTAL_CHARGE) &&
              !isNaN(parseFloat(slotProps.data.TOTAL_CHARGE))
                ? `$ ${formatComma(slotProps.data.TOTAL_CHARGE)}`
                : "No data"
            }}
          </template>
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { debounce } from "lodash";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { FilterMatchMode } from "primevue/api";
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";
import Dropdown from "primevue/dropdown";
import { helpers } from "@/shared/lib/mixins";
import { mdiCompareHorizontal } from "@mdi/js";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const newFilters = computed(() => ({
  global: { value: route.query.search, matchMode: FilterMatchMode.CONTAINS },
}));

const debouncedSearch = debounce(function (data: string): void {
  router.push({
    query: {
      search: data,
    },
  });
}, 300);

const data = ref(null);

const displayedData = computed(() => {
  return data.value.costTable.filter(
    (val) => val.DOMAIN_ID === selectedDomain.value
  );
});

const selectedDomain = ref(null);

const domains = computed(() => {
  return helpers.getValuesArray(data.value.costTable, "DOMAIN_ID", true);
});

const compareToOtherSources = function () {
  const { cdm, release } = route.params;
  router.push({
    name: "networkComparisonTool",
    query: {
      cdm,
      release,
      report: "cost",
    },
  });
};

onMounted(() => {
  data.value = store.getters.getData;
  selectedDomain.value = domains.value[0];
});
</script>

<style scoped>
.p-inputtext {
  width: 200%;
}
</style>
