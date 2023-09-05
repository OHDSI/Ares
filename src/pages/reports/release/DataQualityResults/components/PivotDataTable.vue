<template>
  <v-container fluid>
    <Pivot
      :data="store.getters.getData.rawData.CheckResults"
      :event-listener="pivotRedirectToResultsTab"
      :attributes="[
        'category',
        'cdmFieldName',
        'checkLevel',
        'checkName',
        'context',
        'notesExist',
        'subcategory',
        'cdmTableName',
        'failed',
      ]"
      :aggregator-names-list="['Count']"
    >
    </Pivot>
  </v-container>
</template>

<script setup lang="ts">
import Pivot from "@/widgets/pivot";
import { useStore } from "vuex";
import { RouteLocationNormalizedLoaded, Router } from "vue-router";

const store = useStore();
const pivotRedirectToResultsTab = function (
  router: Router,
  route: RouteLocationNormalizedLoaded,
  componentAttributes: string[]
) {
  return {
    clickCallback: function (e, value, axisAttributes, pivotData) {
      if (value) {
        const params = Object.keys(componentAttributes)
          .filter(
            (attribute) =>
              Object.keys(axisAttributes).includes(attribute) ||
              Object.keys(pivotData.props.valueFilter).includes(attribute)
          )
          .reduce(
            (acc, key) => ({
              ...acc,
              [key]: axisAttributes[key]
                ? axisAttributes[key]
                : Object.values(componentAttributes[key]).filter((attrValue) =>
                    pivotData.props.valueFilter[key]
                      ? !Object.keys(pivotData.props.valueFilter[key]).includes(
                          attrValue
                        )
                      : //empty strings are possible values, as such need additional checks for them, otherwise Object.keys returns an error
                        attrValue === ""
                  ),
            }),
            {}
          );
        router.push({
          path:
            "/cdm/" +
            route.params.cdm +
            "/" +
            route.params.release +
            `/data_quality`,
          query: {
            tab: "results",
            ...params,
          },
        });
      }
    },
  };
};
</script>

<style scoped></style>
