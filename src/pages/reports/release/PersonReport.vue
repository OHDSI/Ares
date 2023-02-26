<template>
  <div>
    <v-container
      v-if="!store.getters.getErrors && store.getters.dataInStore"
      fluid
    >
      <div class="text-uppercase text-h5 ma-4">Person Report</div>
      <v-responsive min-width="900">
        <v-row class="ma-4" justify="start">
          <!-- Total persons in top bar -->
          <v-col cols="2">
            <v-icon left color="primary">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="helpers.formatComma(store.getters.getData.numPersons)"
            ></v-badge>
            <p class="text-caption">Number of People</p>
          </v-col>
          <!-- Gender breakdown in top bar -->
          <v-col cols="4" align="center">
            <v-icon left color="primary">mdi-human-male-female</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="
                'Male: ' +
                helpers.formatComma(store.getters.getData.genderMaleCount) +
                ' (' +
                helpers.formatPercent(store.getters.getData.genderMalePct) +
                ')'
              "
            ></v-badge>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="
                'Female: ' +
                helpers.formatComma(store.getters.getData.genderFemaleCount) +
                ' (' +
                helpers.formatPercent(store.getters.getData.genderFemalePct) +
                ')'
              "
            ></v-badge>
            <p class="text-caption">Proportion by Sex</p>
          </v-col>
        </v-row>
        <v-card :loading="!store.getters.getData" elevation="2" class="ma-4">
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-populationbyageandsex"
            title="Population by Age &amp; Sex"
            width="90"
            :data="store.getters.getData.personData.AGE_GENDER_DATA"
            :config="chartConfigs.specAgeSex"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.PERSON.AGE_GENDER_DATA
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="2"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-race"
            :config="chartConfigs.specRace"
            :data="store.getters.getData.personData.RACE_DATA"
            title="Population by Race"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.PERSON.RACE_DATA
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="2"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-birthyear"
            :config="chartConfigs.specBirthYear"
            :data="store.getters.getData.personData.BIRTH_YEAR_DATA"
            title="Population by Year of Birth"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.PERSON.BIRTH_YEAR_DATA
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="2"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ethnicity"
            :config="chartConfigs.specEthnicity"
            :data="store.getters.getData.personData.ETHNICITY_DATA"
            title="Population by Ethnicity"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.PERSON.ETHNICITY_DATA
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";

import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
.v-tooltip__content {
  pointer-events: initial;
}
.query-link {
  color: white;
}
</style>
