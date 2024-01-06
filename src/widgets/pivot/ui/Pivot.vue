<template>
  <div
    class="flex flex-row gap-5 bg-white dark:bg-surface-800 w-full h-[650px]"
    v-if="data"
  >
    <div style="width: 25%; height: 100%">
      <TabView
        :pt="{
          navContent: {
            class: [''],
          },
          nav: {
            class: [
              'flex flex-row justify-around flex-1',
              'bg-surface-0 dark:bg-surface-800',
              'border-b-2 border-surface-200 dark:border-surface-700',
              'text-surface-900 dark:text-surface-0/80',
            ],
          },
        }"
      >
        <div class="flex flex-row justify-between">
          <TabPanel
            :pt="{
              header: {
                class: ['flex-1 basis-0'],
              },
              headerAction: {
                class: ['justify-center'],
              },
            }"
          >
            <template #header>
              <svg-icon type="mdi" :path="mdiTable"></svg-icon>
              <h3 class="uppercase">Table</h3></template
            >
            <div class="flex flex-col gap-3">
              <Card class="attr-box">
                <template #content>
                  <div class="flex flex-col gap-5 h-[275px]">
                    <MultiSelect
                      style="width: 100%; height: 50px"
                      placeholder="Row Attributes"
                      v-model="selectedRows"
                      :options="getDisplayedAttributes"
                      :pt="{
                        label: { class: ['self-center pl-4 font-light'] },
                      }"
                    >
                      <template #value>Row Attributes</template>
                      <template #dropdownicon>
                        <svg-icon type="mdi" :path="mdiPlusBox"></svg-icon>
                      </template>
                    </MultiSelect>

                    <draggable
                      class="overflow-scroll"
                      item-key="id"
                      v-model="selectedRows"
                      v-if="selectedRows.length"
                    >
                      <template #item="{ element }">
                        <div
                          class="p-5 list-item bg-surface-200 dark:bg-surface-700"
                        >
                          <h3>{{ element }}</h3>

                          <Button plain text @click="removeRows(element)">
                            <svg-icon type="mdi" :path="mdiClose"></svg-icon>
                          </Button>
                        </div>
                      </template>
                    </draggable>
                    <h3 v-else class="placeholder">
                      Select attributes to display
                    </h3>
                  </div>
                </template>
              </Card>
              <Card class="attr-box">
                <template #content>
                  <div class="flex flex-col gap-5 h-[275px]">
                    <MultiSelect
                      style="width: 100%; height: 50px"
                      placeholder="Column Attributes"
                      v-model="selectedCols"
                      :options="getDisplayedAttributes"
                      :pt="{
                        label: { class: ['self-center pl-4 font-light'] },
                      }"
                    >
                      <template #value>Column Attributes</template>
                      <template #dropdownicon>
                        <svg-icon type="mdi" :path="mdiPlusBox"></svg-icon>
                      </template>
                    </MultiSelect>

                    <draggable
                      class="overflow-scroll"
                      item-key="id"
                      v-model="selectedCols"
                      v-if="selectedCols.length"
                    >
                      <template #item="{ element }">
                        <div
                          class="p-5 list-item bg-surface-200 dark:bg-surface-700"
                        >
                          <h3>{{ element }}</h3>

                          <Button plain text @click="removeCols(element)">
                            <svg-icon type="mdi" :path="mdiClose"></svg-icon>
                          </Button>
                        </div>
                      </template>
                    </draggable>
                    <h3 v-else class="placeholder">
                      Select attributes to display
                    </h3>
                  </div>
                </template>
              </Card>
            </div>
          </TabPanel>
          <TabPanel
            :pt="{
              header: {
                class: ['flex-1 basis-0'],
              },
              headerAction: {
                class: ['justify-center'],
              },
            }"
          >
            <template #header>
              <svg-icon type="mdi" :path="mdiDatabaseCog"></svg-icon>
              <h3 class="uppercase">Settings</h3>
            </template>
            <Card>
              <template #content>
                <div class="flex flex-col gap-5">
                  <TreeSelect
                    :pt="{
                      label: { class: ['self-center pl-4 font-light'] },
                    }"
                    style="width: 100%; height: 50px"
                    v-model="selectedFilterAttributes"
                    :options="getFilters"
                    :meta-key-selection="false"
                    selectionMode="multiple"
                    placeholder="Exclude values"
                    class="md:w-20rem w-full"
                  />
                  <Dropdown
                    :pt="{
                      label: { class: ['self-center pl-4 font-light'] },
                    }"
                    style="width: 100%; height: 50px"
                    v-model="aggregateFunction"
                    placeholder="Aggregate function"
                    :options="aggregatorNamesList"
                  ></Dropdown>
                  <Dropdown
                    :pt="{
                      label: { class: ['self-center pl-4 font-light'] },
                    }"
                    v-if="aggregateFunction === 'Sum'"
                    v-model="aggregateValue[0]"
                    hide-details
                    outlined
                    :placeholder="aggregateValue[0]"
                    :options="getAggregateValues"
                  >
                    <template #value>
                      {{ aggregateValue[0] }}
                    </template>
                  </Dropdown>
                </div>
              </template>
            </Card>
          </TabPanel>
        </div>
      </TabView>
    </div>
    <div style="width: 75%; height: 100%" class="table-card overflow-scroll">
      <div
        v-if="selectedCols.length || selectedRows.length"
        style="width: 100%"
        class="table-container"
      >
        <VuePivottable
          v-if="selectedCols.length || selectedRows.length"
          class="align-self-start"
          :data="data"
          :rows="selectedRows"
          :cols="selectedCols"
          :aggregators="aggregators"
          :attributes="getDisplayedAttributes"
          :value-filter="getParsedFiltersForPivotTable"
          :aggregator-name="aggregateFunction"
          :vals="aggregateValue"
          :table-options="
            eventListener
              ? eventListener(router, route, getUniqueAttributeValues)
              : {}
          "
        >
        </VuePivottable>
      </div>
      <div class="placeholder-container h-full" v-else>
        <h2 class="placeholder table-placeholder text-black dark:text-white">
          Choose at least one attribute to display the results
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VuePivottable } from "vue-pivottable";
import "./vue-pivottable.scss";
import { computed, defineProps, Ref, ref, onBeforeMount } from "vue";
import draggable from "vuedraggable";

import SvgIcon from "@jamescoyle/vue-icon";
import { mdiClose, mdiDatabaseCog, mdiPlusBox, mdiTable } from "@mdi/js";

import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";

import {
  useRouter,
  useRoute,
  Router,
  RouteLocationNormalizedLoaded,
} from "vue-router";
import TreeSelect from "primevue/treeselect";

const router = useRouter();
const route = useRoute();

interface Props {
  data: object[];
  attributes?: string[];
  aggregatorNamesList?: string[];
  aggregators?: object;
  aggregateAttrs?: string[];
  defaults?: {
    rows?: string[];
    columns?: string[];
    aggregateValue?: string[];
    aggregateFunction?: string;
  };
  aggregateFunction?: string;
  eventListener?: (
    a: Router,
    b: RouteLocationNormalizedLoaded,
    c: string[]
  ) => {
    clickCallBack: (
      e: any,
      value: any,
      axisAttributes: any,
      pivotData: any
    ) => void;
  };
}

const props = defineProps<Props>();

const getDisplayedAttributes = computed(function () {
  return props.attributes;
});

const getFilters = computed(() => {
  return getDisplayedAttributes.value.map((field, index) => {
    return {
      key: index,
      label: field,
      data: field,
      children: getUniqueAttributeValues.value[field].map((value, valIndex) => {
        return {
          key: `${index}-${valIndex}`,
          label: value,
          data: value,
        };
      }),
    };
  });
});

const getParsedFiltersForPivotTable = computed(() => {
  const keys = Object.keys(selectedFilterAttributes.value);
  return keys.reduce((acc, current) => {
    const keyArray = current.split("-");
    const attribute = keyArray[0];
    const value = keyArray[1];
    return {
      ...acc,
      [getFilters.value[attribute].data]: {
        ...acc[getFilters.value[attribute].data],
        [getFilters.value[attribute].children[value].data]: true,
      },
    };
  }, {});
});

const getAggregateValues = computed(function () {
  if (props.aggregateAttrs) {
    return props.aggregateAttrs;
  } else {
    return getDisplayedAttributes;
  }
});
const getUniqueAttributeValues = computed(function () {
  return getDisplayedAttributes.value.reduce(
    (prevState, currAttribute) => ({
      ...prevState,
      [currAttribute]: [
        ...new Set(props.data.map((datum) => datum[currAttribute])),
      ],
    }),
    {}
  );
});

const selectedRows: Ref<string[]> = ref([]);
const removeRows = function (item: string) {
  selectedRows.value = selectedRows.value.filter((val) => {
    return val !== item;
  });
};
const selectedCols: Ref<string[]> = ref([]);
const removeCols = function (item: string) {
  selectedCols.value = selectedCols.value.filter((val) => {
    return val !== item;
  });
};

const selectedFilterAttributes: Ref<string[]> = ref([]);
const selectedFilterValues: Ref<{ [key: string]: { [key: string]: boolean } }> =
  ref({});

const aggregateFunction: Ref<string> = ref("");
const aggregateValue: Ref<string[]> = ref([""]);

const load = function () {
  selectedRows.value = props.defaults?.rows ? props.defaults.rows : [];
  selectedCols.value = props.defaults?.columns ? props.defaults.columns : [];
  aggregateFunction.value = props.defaults?.aggregateFunction
    ? props.defaults?.aggregateFunction
    : props.aggregatorNamesList[0];
  aggregateValue.value = props.defaults?.aggregateValue
    ? props.defaults?.aggregateValue
    : [getAggregateValues.value[0]];
};

onBeforeMount(() => {
  load();
});
</script>

<style lang="scss">
@import "vue-pivottable";
.attr-box {
  min-height: 270px;
  min-width: 200px;
}

.attr-box + .attr-box {
  margin-top: 10px;
}

.table-card {
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
}

.table-placeholder {
  font-size: 1.5rem !important;
}
.tab-group {
  min-height: 70vh;
  background-color: inherit;
}
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgb(var(--surface-300));
  margin: 0px 8px;
  border-radius: 5px;
  height: 40px;
  cursor: move;
}

.list-item + .list-item {
  margin-top: 8px;
}

.table-container {
  width: 100%;
  height: 100%;
}

.placeholder-container {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  padding: 10px;
  height: 100%;
}

//:deep(.v-text-field__prefix) {
//  font-size: 0.875rem !important;
//  color: white;
//}
//
//:deep(.v-list-item__title) {
//  font-size: 0.875rem !important;
//}
</style>
