<template>
  <v-form
    v-if="environment.WEB_API_ENABLED === 'true' && store.getters.authenticated"
    ref="form"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Vocabulary search</span>
      </v-card-title>

      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-col>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    v-model="query"
                    variant="outlined"
                    density="comfortable"
                    label="Search concepts"
                    placeholder="Your query"
                    @keyup.enter="searchApi"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-autocomplete
                    v-model="vocabularySource"
                    :items="apiSources"
                    variant="outlined"
                    density="comfortable"
                    item-title="sourceKey"
                    item-value="sourceKey"
                    auto-select-first
                    label="Vocabulary source"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col>
                  <v-btn
                    color="primary"
                    elevation="0"
                    rounded
                    class="search-btn"
                    @click="searchApi"
                    >Search</v-btn
                  >
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-data-table
                    :loading="store.getters.getApiData.loading"
                    no-data-text="No concepts found"
                    item-key="CONCEPT_ID"
                    :items-per-page="5"
                    density="compact"
                    :items="store.getters.getApiData.data"
                    :headers="webapiHeaders"
                    loading-text="Loading concepts"
                  >
                    <template #item.actions="{ item }">
                      <v-icon
                        v-if="!addedConcepts[item.raw.CONCEPT_ID]"
                        @click="save(item.raw)"
                        >mdi-plus</v-icon
                      >
                      <v-icon
                        v-if="
                          addedConcepts[item.raw.CONCEPT_ID] === 'Not found'
                        "
                        >mdi-close-octagon</v-icon
                      >
                      <v-icon
                        v-if="addedConcepts[item.raw.CONCEPT_ID] === 'Loaded'"
                        >mdi-check</v-icon
                      >
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
  <v-form v-else ref="form">
    <v-card>
      <v-card-title>
        <span class="text-h5">New Concept</span>
      </v-card-title>

      <v-card-text>
        <v-container fluid>
          <v-row class="flex-column">
            <v-col>
              <v-text-field
                v-model.number="editedItem.CONCEPT_ID"
                :rules="[rules.required, rules.concept]"
                prepend-icon="mdi-chart-timeline-variant-shimmer"
                label="Concept ID"
                density="compact"
                variant="outlined"
                :success-messages="successMessage"
                :error-messages="errors"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-autocomplete
                v-model="editedItem.DOMAIN_ID"
                :rules="[rules.required]"
                label="Domain"
                prepend-icon="mdi-folder"
                density="compact"
                variant="outlined"
                item-value="key"
                :items="domains"
              >
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-btn color="blue darken-1" text @click="save(editedItem)">
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { webApiActions } from "@/shared/api/webAPI";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import { useStore } from "vuex";
import environment from "@/shared/api/environment";
import { VDataTable } from "vuetify/labs/VDataTable";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

import {
  ref,
  defineEmits,
  defineProps,
  onBeforeMount,
  watch,
  Ref,
  nextTick,
} from "vue";

interface Props {
  addedConcepts: object;
  successMessage: string[];
  errors: string;
}
const form: Ref<HTMLFormElement> = ref(null);
const props = defineProps<Props>();
const store = useStore();
const emit = defineEmits(["inputChanged", "save", "close"]);

const query: Ref<string> = ref("");
const vocabularySource: Ref<string> = ref("");
const editedItem = ref({
  CONCEPT_ID: "",
  DOMAIN_ID: "",
});
const domains: Ref<DataTableHeader[]> = ref([
  { title: "Condition occurrence", key: "Condition" },
  { title: "Drug Exposure", key: "Drug" },
  { title: "Device Exposure", key: "Device" },
  { title: "Measurement", key: "Measurement" },
  { title: "Procedure Occurrence", key: "Procedure" },
  { title: "Observation", key: "Observation" },
]);
const defaultItem = {
  CONCEPT_ID: "",
  DOMAIN_ID: "",
};

onBeforeMount((): void => {
  if (environment.WEB_API_ENABLED === "true" && store.getters.authenticated) {
    store.dispatch(webApiActions.FETCH_WEBAPI_INFO).then(() => {
      if (store.getters.getApiData?.error) {
        store.dispatch(ADD_ALERT, {
          message: "WebAPI server replied with status code",
          status: store.getters.getApiData.error.request.status,
        });
        return;
      }
      apiSources.value = store.getters.getApiData.apiSources.filter((source) =>
        source.daimons
          .reduce((array, current) => [...array, current.daimonType], [])
          .includes("Vocabulary")
      );
      vocabularySource.value = apiSources.value[0].sourceKey;
    });
  }
});

watch(editedItem, (): void => {
  emit("inputChanged", editedItem);
});

const rules = {
  required: (value) => !!value || "Required field",
  concept: (value) => {
    const pattern = /^\d+$/;
    return pattern.test(value) || "The field is digits only";
  },
};
const apiSources = ref([]);
const webapiHeaders: Ref<DataTableHeader[]> = ref([
  {
    title: "Concept ID",
    align: "start",
    sortable: true,
    key: "CONCEPT_ID",
  },
  {
    title: "Concept Name",
    align: "start",
    sortable: true,
    key: "CONCEPT_NAME",
  },
  {
    title: "Domain",
    align: "start",
    sortable: true,
    key: "DOMAIN_ID",
  },
  { title: "", key: "actions", sortable: false, align: "" },
]);

const close = function (): void {
  emit("close");
  if (form.value) {
    form.value.resetValidation();
  }
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem);
  });
  store.dispatch(webApiActions.RESET_API_STORAGE);
};
const save = function (item) {
  if (
    environment.WEB_API_ENABLED === "false" &&
    editedItem.value.CONCEPT_ID === "" &&
    editedItem.value.DOMAIN_ID === ""
  ) {
    return;
  }
  emit("save", item);
};
const searchApi = function () {
  if (!query.value.length) {
    return;
  }
  store
    .dispatch(webApiActions.FETCH_VOCABULARY_SEARCH_RESULTS, {
      search: query.value,
      source: vocabularySource.value,
    })
    .then(() => {
      if (store.getters.getApiData?.error) {
        store.dispatch(ADD_ALERT, {
          message: "WebAPI server replied with status code",
          status: store.getters.getApiData.error.request.status,
        });
      }
    });
};
</script>

<script lang="ts">
export default {
  name: "ConceptSearchForm",
};
</script>

<style scoped></style>
