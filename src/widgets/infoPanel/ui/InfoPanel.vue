<template>
  <v-container fluid class="mt-1">
    <v-divider v-if="props.divider" inset class="pa-1"></v-divider>
    <v-row
      ><v-col cols="1" class="pa-2">
        <v-icon color="blue-grey" right>{{
          props.icon ? props.icon : "mdi-help-circle"
        }}</v-icon> </v-col
      ><v-col cols="11" class="text-caption pa-2">
        <v-layout v-if="!props.linkDetails">{{ props.details }}</v-layout>
        <a v-if="props.link" target="_blank" :href="props.link">
          <v-layout v-if="!props.linkDetails"
            >Click here to learn more
            <v-icon icon="mdi-open-in-new" left small
              >mdi-open-in-new</v-icon
            ></v-layout
          >
          <v-layout v-if="props.linkDetails"
            >{{ props.details }}
            <v-icon icon="mdi-open-in-new" left small></v-icon
          ></v-layout>
        </a>
        <router-link v-if="props.routeLink" :to="props.routeLink">
          <v-layout v-if="!props.linkDetails"
            >Click here to learn more
            <v-icon icon="mdi-open-in-new" left small
              >mdi-open-in-new</v-icon
            ></v-layout
          >
          <v-layout v-if="props.linkDetails"
            >{{ props.details }}
            <v-icon icon="mdi-open-in-new" left small
              >mdi-open-in-new</v-icon
            ></v-layout
          >
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
  name: "InfoPanel",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import { LocationQuery } from "vue-router";

interface Props {
  details?: string;
  link?: string;
  routeLink?: string | LocationQuery;
  icon?: string;
  divider?: boolean;
  linkDetails?: boolean;
}

const props = defineProps<Props>();
</script>

<style scoped>
.text-caption {
  margin-top: 4px;
}
</style>
