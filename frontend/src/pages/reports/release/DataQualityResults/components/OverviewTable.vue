<template>
  <div class="ma-2 pa-4">
    <table id="results">
      <thead>
        <tr>
          <td></td>
          <td colspan="4" class="header text-center">Verification</td>
          <td colspan="4" class="header text-center">Validation</td>
          <td colspan="4" class="header text-center">Total</td>
        </tr>
        <tr>
          <td></td>
          <td class="subheader text-center">Pass</td>
          <td class="subheader text-center">Fail</td>
          <td class="subheader text-center">Total</td>
          <td class="subheader text-center">% Pass</td>
          <td class="subheader text-center">Pass</td>
          <td class="subheader text-center">Fail</td>
          <td class="subheader text-center">Total</td>
          <td class="subheader text-center">% Pass</td>
          <td class="subheader text-center">Pass</td>
          <td class="subheader text-center">Fail</td>
          <td class="subheader text-center">Total</td>
          <td class="subheader text-center">% Pass</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-left header">Plausibility</td>
          <td>
            {{ data.Verification.Plausibility.Pass }}
          </td>
          <td>
            {{ data.Verification.Plausibility.Fail }}
          </td>
          <td>
            {{ data.Verification.Plausibility.Total }}
          </td>
          <td>
            {{
              (
                (data.Verification.Plausibility.Pass /
                  data.Verification.Plausibility.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Validation.Plausibility.Pass }}
          </td>
          <td>
            {{ data.Validation.Plausibility.Fail }}
          </td>
          <td>
            {{ data.Validation.Plausibility.Total }}
          </td>
          <td>
            {{
              (
                (data.Validation.Plausibility.Pass /
                  data.Validation.Plausibility.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Total.Plausibility.Pass }}
          </td>
          <td>
            {{ data.Total.Plausibility.Fail }}
          </td>
          <td>
            {{ data.Total.Plausibility.Total }}
          </td>
          <td>
            {{
              (
                (data.Total.Plausibility.Pass / data.Total.Plausibility.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
        </tr>
        <tr>
          <td class="text-left header">Conformance</td>
          <td>
            {{ data.Verification.Conformance.Pass }}
          </td>
          <td>
            {{ data.Verification.Conformance.Fail }}
          </td>
          <td>
            {{ data.Verification.Conformance.Total }}
          </td>
          <td>
            {{
              (
                (data.Verification.Conformance.Pass /
                  data.Verification.Conformance.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Validation.Conformance.Pass }}
          </td>
          <td>
            {{ data.Validation.Conformance.Fail }}
          </td>
          <td>
            {{ data.Validation.Conformance.Total }}
          </td>
          <td>
            {{
              (
                (data.Validation.Conformance.Pass /
                  data.Validation.Conformance.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Total.Conformance.Pass }}
          </td>
          <td>
            {{ data.Total.Conformance.Fail }}
          </td>
          <td>
            {{ data.Total.Conformance.Total }}
          </td>
          <td>
            {{
              (
                (data.Total.Conformance.Pass / data.Total.Conformance.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
        </tr>
        <tr>
          <td class="text-left header">Completeness</td>
          <td>
            {{ data.Verification.Completeness.Pass }}
          </td>
          <td>
            {{ data.Verification.Completeness.Fail }}
          </td>
          <td>
            {{ data.Verification.Completeness.Total }}
          </td>
          <td>
            {{
              (
                (data.Verification.Completeness.Pass /
                  data.Verification.Completeness.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Validation.Completeness.Pass }}
          </td>
          <td>
            {{ data.Validation.Completeness.Fail }}
          </td>
          <td>
            {{ data.Validation.Completeness.Total }}
          </td>
          <td>
            {{
              (
                (data.Validation.Completeness.Pass /
                  data.Validation.Completeness.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Total.Completeness.Pass }}
          </td>
          <td>
            {{ data.Total.Completeness.Fail }}
          </td>
          <td>
            {{ data.Total.Completeness.Total }}
          </td>
          <td>
            {{
              (
                (data.Total.Completeness.Pass / data.Total.Completeness.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
        </tr>
        <tr>
          <td class="text-left header">Total</td>
          <td>
            {{ data.Verification.Total.Pass }}
          </td>
          <td>
            {{ data.Verification.Total.Fail }}
          </td>
          <td>
            {{ data.Verification.Total.Total }}
          </td>
          <td>
            {{
              (
                (data.Verification.Total.Pass / data.Verification.Total.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Validation.Total.Pass }}
          </td>
          <td>
            {{ data.Validation.Total.Fail }}
          </td>
          <td>
            {{ data.Validation.Total.Total }}
          </td>
          <td>
            {{
              (
                (data.Validation.Total.Pass / data.Validation.Total.Total) *
                100
              ).toFixed(1)
            }}%
          </td>
          <td>
            {{ data.Total.Total.Pass }}
          </td>
          <td>
            {{ data.Total.Total.Fail }}
          </td>
          <td>
            {{ data.Total.Total.Total }}
          </td>
          <td>
            {{
              ((data.Total.Total.Pass / data.Total.Total.Total) * 100).toFixed(
                1
              )
            }}%
          </td>
        </tr>
      </tbody>
    </table>
    <Message v-if="data.version === 2" :closable="false" severity="info">
      <div class="flex flex-col gap-1">
        <p class="font-light">
          <span class="font-bold">{{ data.AllNotApplicable }}</span> out of
          <span class="font-bold">{{ data.Total.Total.Pass }}</span> passed
          checks are Not Applicable, due to empty tables or fields
        </p>
        <p class="font-light">
          <span class="font-bold">{{ data.AllIsError }}</span> out of
          <span class="font-bold">{{ data.Total.Total.Fail }}</span> failed
          checks are SQL errors
        </p>
        <p class="font-light">
          Corrected pass percentage for NA and Errors:
          <span class="font-bold"
            >{{ data.correctedPassPercent.toFixed(1) }}%</span
          >
          (<span class="font-bold"
            >{{ data.Total.Total.Pass - data.AllNotApplicable }}/{{
              data.Total.Total.Total - data.AllNotApplicable - data.AllIsError
            }}</span
          >)
        </p>
      </div>
    </Message>
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
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Message from "primevue/message";

const store = useStore();

const data = store.getters.getData.derivedResults;
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
