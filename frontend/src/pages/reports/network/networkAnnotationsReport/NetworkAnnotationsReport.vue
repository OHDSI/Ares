<template>
  <Panel header="Network Annotations">
    <DataTable
      size="small"
      :striped-rows="store.getters.getSettings.strippedRows"
      :value="annotations.annotations"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #header>
        <div class="flex flex-row gap-10">
          <InputGroup unstyled>
            <InputGroupAddon>
              <i class="pi pi-search"></i>
            </InputGroupAddon>
            <InputText
              class="rounded-r-lg"
              style="width: 45rem"
              unstyled
              v-model="search"
              @update:modelValue="debouncedSearch"
              placeholder="Search in Table"
            />
          </InputGroup>
        </div>
      </template>
      <Column field="body.title" header="Title"></Column>
      <Column field="report_name" header="Report">
        <template #body="slotProps">
          <router-link
            class="text-blue-400 hover:underline"
            :to="redirectToPage(slotProps.data)"
            :title="slotProps.data.report_name"
            >{{
              slotProps.data.report_name
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/^./, (c) => c.toUpperCase())
            }}
          </router-link>
        </template>
      </Column>
      <Column field="viz_name" header="Chart Name"></Column>
      <Column field="metadata.value.source" header="Source(s)">
        <template #body="slotProps">
          <!--          <div-->
          <!--            class="source"-->
          <!--            v-if="slotProps.data.metadata.type === 'releaseList'"-->
          <!--          >-->
          <!--            <span-->
          <!--              :key="release"-->
          <!--              v-for="release in slotProps.data.metadata.value.release"-->
          <!--            >-->
          <!--              {{ release }}-->
          <!--            </span>-->
          <!--          </div>-->
          <div class="source">
            <span
              :key="source"
              v-for="source in slotProps.data.metadata.value.source"
            >
              {{ source }}
            </span>
          </div>
          <!--          {{ slotProps.data.metadata.value.source }}-->
        </template>
      </Column>
      <Column field="metadata.value.source" header="Release(s)">
        <template #body="slotProps">
          <div v-if="slotProps.data.metadata.value.release" class="source">
            <span
              :key="release"
              v-for="release in slotProps.data.metadata.value.release"
            >
              <router-link
                class="text-blue-400 hover:underline"
                :to="redirectToPage(slotProps.data, release)"
                :title="slotProps.data.report_name"
              >
                {{ release.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3") }}
              </router-link>
              <!--              {{ release.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3") }}-->
            </span>
          </div>
          <div v-else>*</div>
          <!--          <div class="source" v-else>-->
          <!--            <span-->
          <!--              :key="source"-->
          <!--              v-for="source in slotProps.data.metadata.value.source"-->
          <!--            >-->
          <!--              {{ source }}-->
          <!--            </span>-->
          <!--          </div>-->
          <!--          {{ slotProps.data.metadata.value.source }}-->
        </template>
      </Column>
      <Column field="metadata.value.source" header="Scope">
        <template #body="slotProps">
          {{
            slotProps.data.metadata.type === "releaseList"
              ? "Release"
              : "Source"
          }}
        </template>
      </Column>
      <Column field="createdBy" header="Author"></Column>
      <Column field="createdAt" header="Created At">
        <template #body="slotProps">
          <span
            >{{ new Date(slotProps.data.createdAt).toLocaleDateString() }}:
            {{ new Date(slotProps.data.createdAt).toLocaleTimeString() }}</span
          >
        </template>
      </Column>
      <Column field="updatedAt" header="Updated At">
        <template #body="slotProps">
          <span
            >{{ new Date(slotProps.data.updatedAt).toLocaleDateString() }}:
            {{ new Date(slotProps.data.updatedAt).toLocaleTimeString() }}</span
          >
        </template>
      </Column>
    </DataTable>
    <Paginator
      v-model:first="first"
      :rows="step"
      :totalRecords="annotations.totalResultsCount"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      @update:first="fetchAnnotations"
    />
  </Panel>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Panel from "primevue/panel";
import Column from "primevue/column";
import Paginator from "primevue/paginator";
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { LOAD_ALL_NOTES } from "@/widgets/notesPanel/model/store/actions.type";
import { mdiTable } from "@mdi/js";
import InputGroupAddon from "primevue/inputgroupaddon";
import MultiSelect from "primevue/multiselect";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import { debounce } from "lodash";

const store = useStore();

const first = ref(0);
const step = ref(10);
const search = ref("");

const debouncedSearch = debounce(function (): void {
  fetchAnnotations();
}, 300);

const annotations = computed(() => {
  return {
    totalResultsCount: store.getters.getNotes.totalCount,
    annotations: store.getters.getNotes.annotations,
  };
});

function redirectToPage(annotation, release = null) {
  return {
    name: annotation.report_name,
    params: {
      cdm: annotation.metadata.value.source[0],
      release:
        release ||
        annotation.metadata.value.release?.[0] ||
        store.getters.getSources.filter(
          (source) =>
            source.cdm_source_key === annotation.metadata.value.source[0]
        )[0].releases[0].release_id,
      domain: annotation.domain_name === "NULL" ? null : annotation.domain_name,
      concept: annotation.concept_id === "NULL" ? null : annotation.concept_id,
    },
  };
}

const fetchAnnotations = function () {
  store.dispatch(LOAD_ALL_NOTES, {
    first: first.value,
    step: step.value,
    filter: search.value,
  });
};

onMounted(() => {
  fetchAnnotations();
});
</script>

<style scoped>
.source span:not(:last-child)::after {
  content: ", ";
}
</style>
