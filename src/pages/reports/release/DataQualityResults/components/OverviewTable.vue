<template>
  <div class="ma-2 pa-4">
    <table id="results">
      <thead>
        <tr>
          <td></td>
          <td colspan="3" class="header text-center">Verification</td>
          <td colspan="3" class="header text-center">Validation</td>
          <td colspan="3" class="header text-center">Total</td>
        </tr>
        <tr>
          <td></td>
          <td class="subheader text-center">Pass</td>
          <td class="subheader text-center">Fail</td>
          <td class="subheader text-center">Total</td>
          <td class="subheader text-center">Pass</td>
          <td class="subheader text-center">Fail</td>
          <td class="subheader text-center">Total</td>
          <td class="subheader text-center">Pass</td>
          <td class="subheader text-center">Fail</td>
          <td class="subheader text-center">Total</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-left header">Plausibility</td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Plausibility
                .Pass
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Plausibility
                .Fail
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Plausibility
                .Total
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Plausibility.Pass
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Plausibility.Fail
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Plausibility.Total
            }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Plausibility.Pass }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Plausibility.Fail }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Plausibility.Total }}
          </td>
        </tr>
        <tr>
          <td class="text-left header">Conformance</td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Conformance.Pass
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Conformance.Fail
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Conformance
                .Total
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Conformance.Pass
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Conformance.Fail
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Conformance.Total
            }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Conformance.Pass }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Conformance.Fail }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Conformance.Total }}
          </td>
        </tr>
        <tr>
          <td class="text-left header">Completeness</td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Completeness
                .Pass
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Completeness
                .Fail
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Verification.Completeness
                .Total
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Completeness.Pass
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Completeness.Fail
            }}
          </td>
          <td>
            {{
              store.getters.getData.derivedResults.Validation.Completeness.Total
            }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Completeness.Pass }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Completeness.Fail }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Completeness.Total }}
          </td>
        </tr>
        <tr>
          <td class="text-left header">Total</td>
          <td>
            {{ store.getters.getData.derivedResults.Verification.Total.Pass }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Verification.Total.Fail }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Verification.Total.Total }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Validation.Total.Pass }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Validation.Total.Fail }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Validation.Total.Total }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Total.Pass }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Total.Fail }}
          </td>
          <td>
            {{ store.getters.getData.derivedResults.Total.Total.Total }}
          </td>
        </tr>
      </tbody>
    </table>
    <!--    <v-toolbar density="compact" class="mt-6">-->
    <!--      <ChartActionIcon-->
    <!--        icon="mdi-help-circle"-->
    <!--        tooltip="The Data Quality Overview provides a summary-->
    <!--              of the results of the Data Quality assessment performed by the-->
    <!--              Data Quality Dashboard package."-->
    <!--        @iconClicked="helpers.openNewTab(links.getDataQualityDashboardLink())"-->
    <!--      />-->
    <!--    </v-toolbar>-->
  </div>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
</script>

<style lang="scss" scoped>
td {
  line-height: 30px;
}
table#results {
  width: 100%;
}
table#results tr td.header {
  text-transform: uppercase;
  @apply bg-surface-200 dark:bg-surface-700 #{!important};
}
table#results .subheader {
  text-transform: uppercase;
  @apply bg-surface-200 dark:bg-surface-700 #{!important};
}
table#results {
  border-spacing: 2px;
  border-collapse: separate;
}
table#results td:not(.header, .subheader) {
  font-size: 14px;
  text-align: right;
}
table#results th {
  text-align: left;
}
table#results tbody td {
  padding: 0px 3px 0px 7px;
}
body {
  font-size: 14px;
}
a {
  text-decoration: none;
}
</style>
