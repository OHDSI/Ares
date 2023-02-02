<template>
  <v-menu contained attach :close-on-content-click="false" bottom offset-y>
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props"> Filters </v-btn>
    </template>
    <v-list>
      <v-list-group
        v-for="item in getFilteredHeaders"
        :key="item.title"
        :value="item.title"
      >
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" :title="item.title">{{
            filters[item.key] ? filters[item.key].length + " selected" : ""
          }}</v-list-item>
        </template>
        <v-list-item>
          <v-select
            variant="outlined"
            density="compact"
            v-model="filters[item.key]"
            chips
            closable-chips
            hide-details
            multiple
            :items="helpers.getValuesArray(data, item.key, true)"
          ></v-select>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";
import { helpers } from "@/shared/lib/mixins";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

interface Props {
  items: DataTableHeader[];
  filters: object;
  data: never[];
}
const getFilteredHeaders = computed(() => {
  return props.items.filter((val) =>
    Object.keys(props.filters).includes(val.key)
  );
});

const props = defineProps<Props>();
</script>
<style></style>
