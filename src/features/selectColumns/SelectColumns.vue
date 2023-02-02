<template>
  <v-menu v-model="chooseHeaderMenu" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <v-icon left>mdi-view-column-outline</v-icon>
        Choose Columns to Display
      </v-btn>
    </template>
    <v-list density="compact">
      <v-list-item v-for="(item, index) in props.headers" :key="index">
        <v-checkbox
          v-model="item.show"
          :label="item.title"
          :model-value="item.show"
          hide-details="auto"
        ></v-checkbox>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script lang="ts">
export default {
  name: "SelectColumns",
};
</script>
<script setup lang="ts">
import { defineProps, Ref, ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

const chooseHeaderMenu: Ref<boolean> = ref(false);

interface Props {
  headers: DataTableHeader[];
  value?: string[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
