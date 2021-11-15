<template>
  <v-card elevation="10" class="ma-5 pa-7">
    <v-layout class="ma-4" justify-center>
      <h2>A R E S</h2>
    </v-layout>
    <v-layout justify-center>
      <v-img
        class="inverted"
        :src="require('../assets/icon.png')"
        max-height="64"
        max-width="64"
      ></v-img>
    </v-layout>
    <div class="ma-4 introduction">
      <b>A</b> <b>R</b>esearch <b>E</b>xploration <b>S</b>ystem that facilitates
      exploration of patient level, observational data research accompanied by
      source data characterization and quality assessment ensuring that results
      are presented with proper context.
    </div>
    <v-card-actions>
      <v-layout justify-center>
        <v-btn class="ma-2" dark color="primary" to="/network/overview">
          <v-icon left>mdi-database</v-icon>Explore Data Sources
        </v-btn>
        <!--
        <v-btn class="ma-2" disabled text outlined to="/_network">
          <v-icon left>mdi-file-document</v-icon>Explore Vocabularies
        </v-btn>
        <v-btn class="ma-2" disabled text outlined to="/_network">
          <v-icon left>mdi-file-document</v-icon>Explore Research Papers
        </v-btn>
        -->
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "home",
};
</script>

<style scoped>
.v-card__text {
  line-height: 28px;
}
.inverted {
  filter: invert(1);
}
.introduction {
  line-height: 2;
  font-size: 16px;
}
</style>
