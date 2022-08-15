<template>
  <v-row>
    <v-col cols="3">
      <v-tabs fixed-tabs class="tab-group elevation-10">
        <v-tab>
          <v-icon left> mdi-table </v-icon>
          Table
        </v-tab>
        <v-tab>
          <v-icon left> mdi-database-cog </v-icon>
          Result manipulation
        </v-tab>

        <v-tab-item>
          <v-card class="attr-box elevation-10">
            <v-list class="pa-3">
              <v-select
                v-model="selectedRows"
                solo
                :menu-props="{ bottom: true, offsetY: true }"
                background-color="primary"
                prefix="Row attributes"
                hide-selected
                multiple
                :items="getDisplayedAttributes"
              >
                <template v-slot:selection="{}"></template>
                <template v-slot:append>
                  <v-icon color="white">mdi-plus-box</v-icon> </template
                >filter
              </v-select>
              <draggable v-if="selectedRows.length" v-model="selectedRows">
                <template v-for="(item, i) in selectedRows">
                  <v-list-item :key="i" class="list-item">
                    <v-list-item-content>
                      <v-list-item-title v-text="item"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon @click="removeRows(i)"
                        ><v-icon>mdi-close</v-icon></v-btn
                      >
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </draggable>
              <v-card-text v-else class="placeholder"
                >Select attributes to display</v-card-text
              >
            </v-list>
          </v-card>
          <v-card class="attr-box elevation-10">
            <v-list class="pa-3">
              <v-select
                v-model="selectedCols"
                solo
                :menu-props="{ bottom: true, offsetY: true }"
                background-color="primary"
                prefix="Column attributes"
                hide-selected
                multiple
                :items="getDisplayedAttributes"
              >
                <template v-slot:selection="{}"> </template>
                <template v-slot:append>
                  <v-icon color="white">mdi-plus-box</v-icon>
                </template>
              </v-select>
              <draggable v-if="selectedCols.length" v-model="selectedCols">
                <template v-for="(item, i) in selectedCols">
                  <v-list-item :key="i" class="list-item">
                    <v-list-item-content>
                      <v-list-item-title v-text="item"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon @click="removeCols(i)"
                        ><v-icon>mdi-close</v-icon></v-btn
                      >
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </draggable>
              <v-card-text v-else class="placeholder align-self-center"
                >Select attributes to display</v-card-text
              >
            </v-list>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <v-select
              v-model="selectedFilterAttributes"
              hide-details
              outlined
              class="pa-3 pb-6"
              :menu-props="{ bottom: true, offsetY: true }"
              hide-selected
              clearable
              :items="getDisplayedAttributes"
              chips
              multiple
              label="Filters"
              @click:clear="removeFilterAttributes()"
            >
              <template v-slot:selection="{ attrs, item, select, selected }">
                <v-menu
                  allow-overflow
                  offset-y
                  bottom
                  max-height="500"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      color="primary"
                      :input-value="selected"
                      close
                      v-bind="attrs"
                      @click="select"
                      v-on="on"
                      @click:close="removeFilterAttributes(item)"
                    >
                      {{ item }} ({{
                        selectedFilterValues[item]
                          ? Object.keys(selectedFilterValues[item]).length
                          : 0
                      }})
                    </v-chip>
                  </template>

                  <v-list>
                    <v-list-item
                      v-for="value in getUniqueAttributeValues[item]"
                      :key="value"
                    >
                      <v-checkbox
                        :input-value="
                          selectedFilterValues[item]
                            ? !selectedFilterValues[item][value]
                            : true
                        "
                        :label="value ? value.toString() : value"
                        @change="changeFilterValues(item, value, $event)"
                      ></v-checkbox>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-select>
            <div>
              <v-select
                v-model="aggregateFunction"
                hide-details
                outlined
                class="px-3"
                label="Aggregate function"
                :menu-props="{ bottom: true, offsetY: true }"
                :items="aggregators"
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
        </v-tab-item>
      </v-tabs>
    </v-col>
    <v-col class="overflow-hidden">
      <v-card class="elevation-10 pa-3 table-card">
        <div
          v-if="selectedCols.length || selectedRows.length"
          class="table-container"
        >
          <v-row>
            <vue-pivottable
              v-if="selectedCols.length || selectedRows.length"
              class="align-self-start"
              :data="data"
              :rows="selectedRows"
              :cols="selectedCols"
              :attributes="getDisplayedAttributes"
              :value-filter="selectedFilterValues"
              :aggregator-name="aggregateFunction"
              :vals="aggregateValue"
              :table-options="eventListener(this)"
            >
            </vue-pivottable>
          </v-row>
        </div>
        <v-card-text v-else class="placeholder table-placeholder"
          >Choose at least one attribute to display the results</v-card-text
        >
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { VuePivottable } from "vue-pivottable";
import "./vue-pivottable.css";
import draggable from "vuedraggable";

export default {
  name: "Pivot",
  components: {
    VuePivottable,
    draggable,
  },

  props: {
    data: { type: Array, required: true, default: () => [] },
    attributes: { type: Array, required: false, default: () => [] },
    aggregators: { type: Array, required: false, default: () => [] },
    aggregateAttrs: { type: Array, required: false, default: () => [] },
    defaults: { type: Object, required: false, default: () => {} },
    eventListener: { type: Function, required: false, default: function () {} },
  },
  data() {
    return {
      selectedRows: [],
      selectedFilterAttributes: [],
      selectedCols: [],
      selectedFilterValues: {},
      aggregateFunction: "",
      aggregateValue: [""],
    };
  },

  computed: {
    getUniqueAttributeValues: function () {
      return this.getDisplayedAttributes.reduce(
        (prevState, currAttribute) => ({
          ...prevState,
          [currAttribute]: [
            ...new Set(this.data.map((datum) => datum[currAttribute])),
          ],
        }),
        {}
      );
    },
    getAggregateValues: function () {
      if (this.aggregateAttrs.length) {
        return this.aggregateAttrs;
      } else {
        return this.getDisplayedAttributes;
      }
    },
    getDisplayedAttributes: function () {
      return this.attributes;
    },
  },
  created() {
    this.load();
  },
  methods: {
    load: function () {
      this.selectedRows = this.defaults?.rows ? this.defaults.rows : [];
      this.selectedCols = this.defaults?.columns ? this.defaults.columns : [];
      this.aggregateFunction = this.defaults?.aggregateFunction
        ? this.defaults?.aggregateFunction
        : this.aggregators[0];
      this.aggregateValue = this.defaults?.aggregateValue
        ? this.defaults?.aggregateValue
        : [this.getAggregateValues[0]];
    },
    removeRows(i) {
      this.$delete(this.selectedRows, i);
    },
    removeCols(i) {
      this.$delete(this.selectedCols, i);
    },
    removeFilterAttributes: function (attribute = null) {
      if (attribute) {
        this.selectedFilterAttributes = this.selectedFilterAttributes.filter(
          (value) => attribute !== value
        );
        this.selectedFilterValues = Object.keys(this.selectedFilterValues)
          .filter((value) => value !== attribute)
          .reduce(
            (acc, key) => ({ ...acc, [key]: this.selectedFilterValues[key] }),
            {}
          );
      } else {
        this.selectedFilterAttributes = [];
        this.selectedFilterValues = {};
      }
    },
    changeFilterValues: function (attribute, attrValue, value) {
      if (!value) {
        this.selectedFilterValues = {
          ...this.selectedFilterValues,
          [attribute]: {
            ...this.selectedFilterValues[attribute],
            [attrValue]: true,
          },
        };
      } else {
        this.selectedFilterValues[attribute] = Object.keys(
          this.selectedFilterValues[attribute]
        )
          .filter((attr) => attr !== attrValue)
          .reduce(
            (acc, key) => ({
              ...acc,
              [key]: true,
            }),
            {}
          );
      }
    },
  },
};
</script>

<style scoped>
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
  background-color: var(--v-accent-base);
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

>>> .v-text-field__prefix {
  font-size: 0.875rem !important;
  color: white;
}

>>> .v-list-item__title {
  font-size: 0.875rem !important;
}
</style>
