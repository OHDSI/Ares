<template>
  <Dialog
    v-if="environment.WEB_API_ENABLED === 'true' && store.getters.authenticated"
    :pt="{
      root: { class: 'h-[520px] w-[850px]' },
    }"
    header="Vocabulary Search"
    unstyled
    modal
    v-model:visible="sh"
  >
    <div class="h-full relative">
      <div class="p-6">
        <div class="flex flex-col gap-10 p-3">
          <div class="flex flex-row gap-5">
            <InputText
              v-model="query"
              title="Search concepts"
              label="Search concepts"
              placeholder="Your query"
              @keyup.enter="searchApi"
            ></InputText>
            <Dropdown
              v-model="vocabularySource"
              :options="apiSources"
              option-label="sourceKey"
              option-value="sourceKey"
              placeholder="Vocabulary source"
            >
            </Dropdown>
            <Button
              color="primary"
              style="width: 12rem"
              class="search-btn"
              @click="searchApi"
              >Search</Button
            >
          </div>
          <div>
            <DataTable
              :loading="store.getters.getApiData.loading"
              removable-sort
              size="small"
              paginator
              :value="store.getters.getApiData.data"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
            >
              <template #empty> No concepts found </template>
              <Column sortable header="Concept ID" field="CONCEPT_ID"></Column>
              <Column
                sortable
                header="Concept Name"
                field="CONCEPT_NAME"
              ></Column>
              <Column sortable header="Domain" field="DOMAIN_ID"></Column>
              <Column header="">
                <template #body="slotProps">
                  <!--              <v-icon-->
                  <!--                v-if="!addedConcepts[slotProps.data.CONCEPT_ID]"-->
                  <!--                @click="save(slotProps.data)"-->
                  <!--                >{{ mdiPlus }}</v-icon-->
                  <!--              >-->
                  <!--              <v-icon-->
                  <!--                v-if="addedConcepts[slotProps.data.CONCEPT_ID] === 'Not found'"-->
                  <!--                >{{ mdiCloseOctagon }}</v-icon-->
                  <!--              >-->
                  <!--              <v-icon-->
                  <!--                v-if="addedConcepts[slotProps.data.CONCEPT_ID] === 'Loaded'"-->
                  <!--                >{{ mdiCheck }}</v-icon-->
                  <!--              >-->
                  <Button
                    text
                    v-if="!addedConcepts[slotProps.data.CONCEPT_ID]"
                    icon="pi pi-plus"
                    outlined
                    rounded
                    class="mr-2"
                    @click="save(slotProps.data)"
                  />
                  <Button
                    text
                    v-if="
                      addedConcepts[slotProps.data.CONCEPT_ID] === 'Not found'
                    "
                    icon="pi pi-times"
                    outlined
                    rounded
                    severity="danger"
                  />
                  <Button
                    text
                    v-if="addedConcepts[slotProps.data.CONCEPT_ID] === 'Loaded'"
                    icon="pi pi-check"
                    outlined
                    rounded
                    severity="success"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 right-0">
        <Button text severity="danger" size="large" @click="close"
          >CLOSE</Button
        >
      </div>
    </div>
  </Dialog>
  <Dialog
    v-else
    :pt="{
      root: { class: 'w-[400px]' },
    }"
    modal
    v-model:visible="sh"
    header="New Concept"
  >
    <div class="p-3">
      <div class="flex flex-col gap-5">
        <InputText
          v-model.number="editedItem.CONCEPT_ID"
          :rules="[rules.required, rules.concept]"
          prepend-icon="mdi-chart-timeline-variant-shimmer"
          label="Concept ID"
          density="compact"
          variant="outlined"
          :success-messages="successMessage"
          :error-messages="errors"
        >
        </InputText>
        <Dropdown
          v-model="editedItem.DOMAIN_ID"
          :rules="[rules.required]"
          label="Domain"
          option-label="title"
          prepend-icon="mdi-folder"
          density="compact"
          variant="outlined"
          option-value="key"
          :options="domains"
        >
        </Dropdown>
      </div>
      <div class="flex flex-row justify-between relative bottom-0">
        <Button text severity="danger" size="large" @click="sh = false"
          >CANCEL</Button
        >
        <Button text severity="info" size="large" @click="save(editedItem)"
          >SAVE</Button
        >
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { webApiActions } from "@/shared/api/webAPI";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import { useStore } from "vuex";
import environment from "@/shared/api/environment";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import {
  ref,
  defineEmits,
  defineProps,
  onBeforeMount,
  watch,
  Ref,
  nextTick,
} from "vue";
import { computed } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

interface Props {
  addedConcepts: object;
  successMessage: string[];
  errors: string;
  show: boolean;
}

const sh = computed({
  get: function () {
    return props.show;
  },
  set: function () {
    emit("close");
  },
});

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
