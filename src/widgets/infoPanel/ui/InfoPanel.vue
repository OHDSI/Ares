<template>
  <v-container fluid class="mt-1">
    <v-divider v-if="divider" inset class="pa-1"></v-divider>
    <v-row
      ><v-col cols="1" class="pa-2">
        <v-icon color="blue-grey" right>{{ icon }}</v-icon> </v-col
      ><v-col cols="11" class="text-caption pa-2">
        <v-layout v-if="!linkDetails">{{ details }}</v-layout>
        <a v-if="link != undefined" target="_blank" :href="link">
          <v-layout v-if="!linkDetails"
            >Click here to learn more
            <v-icon left small color="primary"
              >mdi-open-in-new</v-icon
            ></v-layout
          >
          <v-layout v-if="linkDetails"
            >{{ details }}
            <v-icon left small color="primary"
              >mdi-open-in-new</v-icon
            ></v-layout
          >
        </a>
        <router-link v-if="routeLink" :to="routeLink">
          <v-layout v-if="!linkDetails"
            >Click here to learn more
            <v-icon left small color="primary"
              >mdi-open-in-new</v-icon
            ></v-layout
          >
          <v-layout v-if="linkDetails"
            >{{ details }}
            <v-icon left small color="primary"
              >mdi-open-in-new</v-icon
            ></v-layout
          >
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Infopanel",
  props: {
    details: { type: String },
    link: { type: String },
    routeLink: { type: Object },
    icon: { type: String, default: "mdi-help-circle" },
    divider: { type: Boolean, default: true },
    linkDetails: { type: Boolean, default: false },
  },
  data() {
    return {};
  },
  created() {},
};
</script>

<style scoped>
.text-caption {
  margin-top: 4px;
}
</style>
