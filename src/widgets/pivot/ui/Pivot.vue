<template>
  <v-row v-if="data">
    <v-col cols="3">
      <v-card>
        <v-tabs v-model="tab" fixed-tabs>
          <v-tab value="table">
            <v-icon left> mdi-table </v-icon>
            Table
          </v-tab>
          <v-tab value="manipulation">
            <v-icon left> mdi-database-cog </v-icon>
            Settings
          </v-tab>
        </v-tabs>
        <v-window v-model="tab" class="my-2">
          <v-window-item value="table">
            <v-card class="attr-box">
              <v-list class="pa-3">
                <v-select
                  v-model="selectedRows"
                  variant="solo"
                  :menu-props="{ bottom: true, offsetY: true }"
                  menu-icon="mdi-plus-box"
                  persistent-placeholder
                  prefix="Row attributes"
                  hide-selected
                  multiple
                  :items="getDisplayedAttributes"
                >
                  <template #selection="{}"></template>
                  filter
                </v-select>
                <draggable
                  item-key="id"
                  v-model="selectedRows"
                  v-if="selectedRows.length"
                >
                  <template #item="{ element }">
                    <v-list-item class="list-item">
                      <v-list-item-title>
                        <v-list-item-title>{{ element }}</v-list-item-title>
                      </v-list-item-title>
                      <template v-slot:append="{}">
                        <v-list-item-action end>
                          <v-btn
                            variant="plain"
                            density="compact"
                            icon
                            @click="removeRows(element)"
                            ><v-icon>mdi-close</v-icon></v-btn
                          >
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>
                </draggable>
                <v-card-text v-else class="placeholder"
                  >Select attributes to display</v-card-text
                >
              </v-list>
            </v-card>
            <v-card class="attr-box">
              <v-list class="pa-3">
                <v-select
                  v-model="selectedCols"
                  variant="solo"
                  persistent-placeholder
                  menu-icon="mdi-plus-box"
                  :menu-props="{ bottom: true, offsetY: true }"
                  prefix="Column attributes"
                  hide-selected
                  multiple
                  :items="getDisplayedAttributes"
                >
                  <template #selection="{}"> </template>
                </v-select>
                <draggable
                  item-key="id"
                  v-model="selectedCols"
                  v-if="selectedCols.length"
                >
                  <template #item="{ element }">
                    <v-list-item class="list-item">
                      <v-list-item-title>
                        <v-list-item-title>{{ element }}</v-list-item-title>
                      </v-list-item-title>
                      <template v-slot:append="{}">
                        <v-list-item-action end>
                          <v-btn
                            variant="plain"
                            density="compact"
                            icon
                            @click="removeCols(element)"
                            ><v-icon>mdi-close</v-icon></v-btn
                          >
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>
                </draggable>

                <v-card-text v-else class="placeholder align-self-center"
                  >Select attributes to display</v-card-text
                >
              </v-list>
            </v-card>
          </v-window-item>
          <v-window-item value="manipulation">
            <v-card>
              <v-select
                v-model="selectedFilterAttributes"
                hide-details
                variant="outlined"
                class="pa-3 pb-6"
                :menu-props="{ bottom: true, offsetY: true }"
                hide-selected
                clearable
                :items="getDisplayedAttributes"
                multiple
                label="Filters"
                @click:clear="removeFilterAttributes()"
              >
                <template v-slot:selection="{ item, select, selected }">
                  <v-menu
                    allow-overflow
                    offset-y
                    bottom
                    max-height="500"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ props }">
                      <v-chip
                        closable
                        :input-value="selected"
                        v-bind="props"
                        @click="select"
                        @click:close="removeFilterAttributes(item.raw)"
                      >
                        {{ item.raw }} ({{
                          selectedFilterValues[item.raw]
                            ? Object.keys(selectedFilterValues[item.raw]).length
                            : 0
                        }})
                      </v-chip>
                    </template>

                    <v-list>
                      <v-list-item
                        v-for="value in getUniqueAttributeValues[item.raw]"
                        :key="value"
                      >
                        <v-checkbox-btn
                          :model-value="
                            selectedFilterValues[item.raw]
                              ? !selectedFilterValues[item.raw][value]
                              : true
                          "
                          :label="value ? value.toString() : value"
                          @update:modelValue="
                            changeFilterValues(item.raw, value, $event)
                          "
                        ></v-checkbox-btn>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-select>
              <div>
                <v-select
                  v-model="aggregateFunction"
                  hide-details
                  variant="outlined"
                  class="px-3"
                  label="Aggregate function"
                  :menu-props="{ bottom: true, offsetY: true }"
                  :items="aggregatorNamesList"
                ></v-select>
                <v-select
                  v-if="aggregateFunction === 'Sum'"
                  v-model="aggregateValue[0]"
                  hide-details
                  outlined
                  class="pa-3"
                  label="Aggregate attribute"
                  :menu-props="{ bottom: true, offsetY: true }"
                  :items="getAggregateValues"
                ></v-select>
              </div>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </v-col>
    <v-col class="overflow-hidden">
      <v-card class="pa-3 table-card">
        <div
          v-if="selectedCols.length || selectedRows.length"
          class="table-container"
        >
          <v-row>
            <VuePivottable
              v-if="selectedCols.length || selectedRows.length"
              class="align-self-start"
              :data="data"
              :rows="selectedRows"
              :cols="selectedCols"
              :aggregators="aggregators"
              :attributes="getDisplayedAttributes"
              :value-filter="selectedFilterValues"
              :aggregator-name="aggregateFunction"
              :vals="aggregateValue"
              :table-options="
                eventListener
                  ? eventListener(router, route, getUniqueAttributeValues)
                  : {}
              "
            >
            </VuePivottable>
          </v-row>
        </div>
        <v-card-text v-else class="placeholder table-placeholder"
          >Choose at least one attribute to display the results</v-card-text
        >
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import draggable from "vuedraggable";

export default {
  name: "PivotTable",
  components: {
    draggable,
  },
};
</script>
<script setup lang="ts">
import { VuePivottable } from "vue-pivottable";
import "./vue-pivottable.css";
import { computed, defineProps, Ref, ref, onBeforeMount } from "vue";

import {
  useRouter,
  useRoute,
  Router,
  RouteLocationNormalizedLoaded,
} from "vue-router";

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

const tab: Ref<string> = ref("");

const props = defineProps<Props>();

const getDisplayedAttributes = computed(function () {
  return props.attributes;
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
const removeFilterAttributes = function (attribute = null) {
  if (attribute) {
    selectedFilterAttributes.value = selectedFilterAttributes.value.filter(
      (value) => attribute !== value
    );
    selectedFilterValues.value = Object.keys(selectedFilterValues.value)
      .filter((value) => value !== attribute)
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]:
            selectedFilterValues.value[
              key as keyof typeof selectedFilterValues.value
            ],
        }),
        {}
      );
  } else {
    selectedFilterAttributes.value = [];
    selectedFilterValues.value = {};
  }
};
const changeFilterValues = function (
  attribute: string | number,
  attrValue: string | number,
  value: string | number
) {
  if (!value) {
    selectedFilterValues.value = {
      ...selectedFilterValues.value,
      [attribute]: {
        ...selectedFilterValues.value[
          attribute as keyof typeof selectedFilterValues.value
        ],
        [attrValue]: true,
      },
    };
  } else {
    selectedFilterValues.value = {
      ...selectedFilterValues.value,
      [attribute]: Object.keys(
        selectedFilterValues.value[
          attribute as keyof typeof selectedFilterValues.value
        ]
      )
        .filter((attr) => attr !== attrValue)
        .reduce(
          (acc, key) => ({
            ...acc,
            [key]: true,
          }),
          {}
        ),
    };
  }
};

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
@import "./vue-pivottable.css";
.attr-box {
  min-height: 300px;
  min-width: 200px;
}

.attr-box + .attr-box {
  margin-top: 10px;
}

.table-card {
  padding: 10px;
  width: 100%;
  height: 100%;
  display: flex !important;
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
  background-color: rgb(var(--v-theme-accent));
  margin: 0px 8px;
  border-radius: 5px;
  height: 20px;
  cursor: move;
}

.list-item + .list-item {
  margin-top: 8px;
}

.table-container {
  padding: 10px;
  width: 100%;
  height: 100%;
}
:deep(.v-text-field__prefix) {
  font-size: 0.875rem !important;
  color: white;
}

:deep(.v-list-item__title) {
  font-size: 0.875rem !important;
}
</style>
