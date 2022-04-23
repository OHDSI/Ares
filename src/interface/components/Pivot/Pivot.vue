<template>
  <v-row>
    <v-col cols="3">
      <v-card class="attr-box elevation-10">
        <v-list class="pa-3">
          <v-select
            v-model="selectedRows"
            prefix="Row attributes"
            append-icon="mdi-plus-box"
            hide-selected
            multiple
            :items="attributes"
          >
            <template v-slot:selection="{}"></template>
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
            prefix="Column attributes"
            append-icon="mdi-plus-box"
            hide-selected
            multiple
            :items="attributes"
          >
            <template v-slot:selection="{}"> </template>
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
    </v-col>
    <v-col class="overflow-hidden">
      <v-card class="elevation-10 pa-3 table-container">
        <vue-pivottable
          v-if="selectedCols.length || selectedRows.length"
          class="align-self-start"
          :data="data"
          :rows="selectedRows"
          :cols="selectedCols"
          :attributes="attributes"
        >
        </vue-pivottable>
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
  },
  data() {
    return {
      selectedRows: [],
      selectedCols: [],
    };
  },

  computed: {},
  methods: {
    removeRows(i) {
      this.$delete(this.selectedRows, i);
    },
    removeCols(i) {
      this.$delete(this.selectedCols, i);
    },
  },
};
</script>

<style>
.attr-box {
  min-height: 300px;
  min-width: 200px;
}

.attr-box + .attr-box {
  margin-top: 10px;
}

.table-container {
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

.list-item {
  background-color: var(--v-accent-base);
  margin: 2px 8px;
  border-radius: 10px;
  height: 20px;
}
</style>
