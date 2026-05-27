<template>
  <div class="cohort-definition">
    <div class="section">
      <div class="controls">
        <div class="selector-wrap">
          <label class="field-label">Cohort</label>
          <Dropdown
            v-model="selectedCohortId"
            :options="cohortOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a cohort…"
            filter
            :virtualScrollerOptions="{ itemSize: 28 }"
            class="cohort-dropdown"
          >
            <template #option="{ option }">
              <div
                :class="[
                  'cohort-opt',
                  { 'cohort-opt--subset': option.isSubset },
                ]"
              >
                <span v-if="option.isSubset" class="subset-arrow">↳</span>
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Dropdown>
        </div>
        <div class="control-action">
          <GenerateButton :disabled="generateDisabled" @click="generate" />
        </div>
      </div>
    </div>

    <div v-if="showResults" class="section results-body">
      <ViewToggle
        v-model="activeTab"
        :tabs="tabs"
        :disabled-tabs="disabledResultTabs"
      />

      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab">
          <div v-if="activeTab === 0" class="definition-body">
            <template v-if="selectedIsSubset">
              <div class="subset-notice">
                <p class="subset-notice__text">
                  This is a subset cohort - defined by applying additional
                  filters to a parent cohort rather than by its own entry
                  criteria. Switch to the parent to view its definition.
                </p>
                <button
                  v-if="parentCohort"
                  class="parent-link"
                  @click="loadParent"
                >
                  <i class="pi pi-arrow-right" />
                  View definition for
                  <strong>{{ parentCohort.cohortName }}</strong>
                </button>
              </div>
            </template>
            <template v-else>
              <div v-if="definitionLoading" class="loading-msg">Loading…</div>
              <div
                v-else-if="definitionMarkdown"
                class="definition-md"
                v-html="definitionHtml"
              />
              <div v-else class="loading-msg">No definition available.</div>
            </template>
          </div>

          <div v-else-if="activeTab === 1" class="code-block-wrap">
            <CopyButton :text="prettyJson" />
            <Codemirror
              :model-value="prettyJson"
              :extensions="jsonExtensions"
              :disabled="true"
              class="cm-block"
            />
          </div>

          <div v-else-if="activeTab === 2" class="code-block-wrap">
            <CopyButton :text="selectedDef.sql" />
            <Codemirror
              :model-value="selectedDef.sql ?? ''"
              :extensions="sqlExtensions"
              :disabled="true"
              class="cm-block"
            />
          </div>

          <div v-else-if="activeTab === 3" class="attrition-section">
            <div v-if="attritionLoading" class="loading-msg">
              Loading attrition data…
            </div>

            <template v-else-if="inclusionRules.length">
              <div class="attrition-controls">
                <div class="control-group">
                  <label class="field-label">Database</label>
                  <Dropdown
                    v-model="selectedDatabase"
                    :options="availableDatabases"
                    placeholder="Select database…"
                    class="db-dropdown"
                  />
                </div>
                <div class="control-group">
                  <label class="field-label">Mode</label>
                  <SelectButton
                    v-model="modeId"
                    :options="modeOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
              </div>

              <template v-if="selectedDatabase">
                <DataTable
                  :value="attritionRows"
                  size="small"
                  class="attrition-table"
                >
                  <Column header="Rule" field="ruleName" />
                  <Column
                    :header="modeId === 1 ? 'Subjects' : 'Records'"
                    field="personCount"
                  >
                    <template #body="{ data }">{{
                      formatComma(data.personCount)
                    }}</template>
                  </Column>
                  <Column header="Dropped" field="dropCount">
                    <template #body="{ data }">
                      {{ formatComma(data.dropCount) }}
                      <span class="pct-label">({{ data.dropPercent }})</span>
                    </template>
                  </Column>
                  <Column header="Retained" field="retainPercent" />
                </DataTable>
                <AttritionChart :rows="attritionRows" />
              </template>
              <div v-else class="loading-msg">
                Select a database to view attrition.
              </div>
            </template>

            <div v-else class="loading-msg">
              No inclusion rules defined for this cohort.
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select a cohort, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { marked } from "marked";
import Dropdown from "primevue/dropdown";
import SelectButton from "primevue/selectbutton";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { Codemirror } from "vue-codemirror";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatComma } from "@/shared/lib/formatters";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import ResultsLoader from "@/pages/strategus/characterization/shared/resultsLoader";
import ViewToggle from "@/pages/strategus/characterization/shared/viewToggle";
import CopyButton from "@/shared/lib/copyButton";
import AttritionChart from "@/pages/strategus/cohortGenerator/attritionChart";
import { computeAttrition, MODE_OPTIONS } from "../attritionUtils";
import { useCohortUrl } from "@/shared/lib/composables/useCohortUrl";

marked.use({ async: false });

const sqlExtensions = [sql()];
const jsonExtensions = [json()];

const props = defineProps<{ cohortList: any[] }>();

const { readUrl, updateUrl } = useCohortUrl();

const cohortOptions = computed(() => {
  const main = props.cohortList.filter((c) => !c.subsetDefinitionId);
  const subsets = props.cohortList.filter((c) => c.subsetDefinitionId);
  const parentIds = new Set(main.map((c) => c.cohortDefinitionId));

  const items: { label: string; value: number; isSubset: boolean }[] = [];
  for (const parent of main) {
    items.push({
      label: parent.cohortName,
      value: parent.cohortDefinitionId,
      isSubset: false,
    });
    for (const s of subsets.filter(
      (s) => s.subsetParent === parent.cohortDefinitionId,
    )) {
      items.push({
        label: s.cohortName,
        value: s.cohortDefinitionId,
        isSubset: true,
      });
    }
  }
  for (const orphan of subsets.filter((s) => !parentIds.has(s.subsetParent))) {
    items.push({
      label: orphan.cohortName,
      value: orphan.cohortDefinitionId,
      isSubset: true,
    });
  }
  return items;
});

const _url = readUrl();
const selectedCohortId = ref<number | null>(_url.cohortId ?? null);
const selectedDef = ref<any>(null);
const loading = ref(false);
const showResults = ref(false);
const loaderState = ref<"idle" | "loading" | "success" | "error">("idle");
const lastGeneratedConfig = ref<{ cohortId: number } | null>(null);
const activeTab = ref(_url.defTab ?? 0);

const tabs = [
  { key: "definition", label: "Definition" },
  { key: "json", label: "JSON" },
  { key: "sql", label: "SQL" },
  { key: "attrition", label: "Inclusion Rules & Attrition" },
];

const prettyJson = computed(() => {
  if (!selectedDef.value?.json) return "";
  try {
    return JSON.stringify(JSON.parse(selectedDef.value.json), null, 2);
  } catch {
    return selectedDef.value.json;
  }
});

const definitionLoading = ref(false);
const definitionMarkdown = ref<string>("");
const definitionHtml = computed(() =>
  definitionMarkdown.value
    ? (marked.parse(definitionMarkdown.value) as string)
    : "",
);

const inclusionRules = ref<any[]>([]);
const inclusionStats = ref<any[]>([]);
const attritionLoading = ref(false);
const selectedDatabase = ref<string | null>(_url.database ?? null);
const modeId = ref(_url.modeId ?? 1);
const modeOptions = MODE_OPTIONS;

const availableDatabases = computed(() =>
  [
    ...new Set(inclusionStats.value.map((r) => r.databaseName as string)),
  ].sort(),
);

const attritionRows = computed(() => {
  if (!selectedDatabase.value || !inclusionRules.value.length) return [];
  return computeAttrition(
    inclusionRules.value,
    inclusionStats.value,
    modeId.value,
    selectedDatabase.value,
  );
});

watch(availableDatabases, (dbs) => {
  if (dbs.length && !selectedDatabase.value) {
    selectedDatabase.value = dbs[0];
  }
});

watch(activeTab, (val) => updateUrl({ defTab: val }));
watch(modeId, (val) => updateUrl({ modeId: val }));
watch(selectedDatabase, (val) => updateUrl({ database: val ?? undefined }));

async function generate(isRestoring = false) {
  if (!selectedCohortId.value) return;
  loading.value = true;
  showResults.value = false;
  loaderState.value = "loading";
  definitionMarkdown.value = "";
  inclusionRules.value = [];
  inclusionStats.value = [];

  if (!isRestoring) {
    activeTab.value = 0;
    selectedDatabase.value = null;
    updateUrl({ cohortId: selectedCohortId.value, defTab: 0 });
  }

  const loadStart = Date.now();
  try {
    const [defRes, markdownRes, rulesRes, statsRes] = await Promise.all([
      StrategusService.cohorts.getDefinitions(),
      StrategusService.cohorts.getDefinitionMarkdown(selectedCohortId.value),
      StrategusService.cohorts.getInclusionRules(selectedCohortId.value),
      StrategusService.cohorts.getInclusionStats(selectedCohortId.value),
    ]);

    const defs: any[] = defRes.data ?? [];
    selectedDef.value =
      defs.find((d) => d.cohortDefinitionId === selectedCohortId.value) ?? null;

    definitionMarkdown.value =
      (markdownRes.data as { markdown: string })?.markdown ?? "";

    inclusionRules.value = rulesRes.data ?? [];
    inclusionStats.value = statsRes.data ?? [];

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));

    lastGeneratedConfig.value = { cohortId: selectedCohortId.value };
    showResults.value = true;
  } catch (e) {
    console.error("Failed to generate cohort definition:", e);
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const selectedIsSubset = computed(
  () =>
    cohortOptions.value.find((o) => o.value === selectedCohortId.value)
      ?.isSubset ?? false,
);

const disabledResultTabs = computed(() => (selectedIsSubset.value ? [3] : []));

watch(selectedIsSubset, (isSubset) => {
  if (isSubset && activeTab.value === 3) activeTab.value = 0;
});

const parentCohort = computed(() => {
  const raw = props.cohortList.find(
    (c) => c.cohortDefinitionId === selectedCohortId.value,
  );
  if (!raw?.subsetParent) return null;
  return (
    props.cohortList.find((c) => c.cohortDefinitionId === raw.subsetParent) ??
    null
  );
});

function loadParent() {
  if (!parentCohort.value) return;
  selectedCohortId.value = parentCohort.value.cohortDefinitionId;
  generate();
}

const generateDisabled = computed(() => {
  if (!selectedCohortId.value) return true;
  if (!lastGeneratedConfig.value) return false;
  return selectedCohortId.value === lastGeneratedConfig.value.cohortId;
});

if (selectedCohortId.value) {
  generate(true);
}

watch(selectedCohortId, () => {
  showResults.value = false;
  selectedDef.value = null;
  definitionMarkdown.value = "";
  inclusionRules.value = [];
  inclusionStats.value = [];
  selectedDatabase.value = null;
});
</script>

<style scoped>
@import "../../characterization/shared/styles.css";

.cohort-definition {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls {
  display: flex;
  align-items: flex-end;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.selector-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cohort-dropdown {
  width: 360px;
}

.cohort-opt {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cohort-opt--subset {
  padding-left: 0.75rem;
  color: var(--color-text-muted);
}

.subset-arrow {
  color: var(--color-text-subtle);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.loading-msg {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

.definition-body {
  padding: 0.25rem 0;
}

.definition-md {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-text);
  max-width: 860px;
}

.definition-md :deep(h3) {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 1.25rem 0 0.35rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--color-border);
}

.definition-md :deep(h4) {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0.9rem 0 0.25rem;
}

.definition-md :deep(p) {
  margin: 0.3rem 0;
}

.definition-md :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 0.35rem 0;
}

.definition-md :deep(li) {
  margin: 0.2rem 0;
}

.definition-md :deep(table) {
  border-collapse: collapse;
  font-size: 0.8125rem;
  margin: 0.5rem 0 0.75rem;
  width: 100%;
}

.definition-md :deep(th),
.definition-md :deep(td) {
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  text-align: left;
}

.definition-md :deep(th) {
  background: var(--color-bg-surface);
  font-weight: 600;
  color: var(--color-text-muted);
}

.code-block-wrap {
  position: relative;
}

.code-block-wrap :deep(.copy-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
}

.cm-block :deep(.cm-editor) {
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  max-height: 520px;
  overflow-y: auto;
}

.cm-block :deep(.cm-scroller) {
  font-family: ui-monospace, "JetBrains Mono", monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  padding-top: 2.5rem;
}

.cm-block :deep(.cm-content) {
  padding: 0.875rem 1rem;
  padding-top: 0;
}

.cm-block :deep(.cm-focused) {
  outline: none;
}

.cm-block :deep(.cm-gutters) {
  border-radius: 6px 0 0 6px;
}

.attrition-controls {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.875rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.db-dropdown {
  width: 240px;
}

.attrition-table {
  margin-bottom: 1rem;
}

.pct-label {
  color: var(--color-text-subtle);
  font-size: 0.8125rem;
  margin-left: 0.25rem;
}

.subset-notice {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 540px;
  padding: 0.875rem 1rem;
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
}

.subset-notice__text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.parent-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: var(--color-interactive-hover);
  cursor: pointer;
  text-align: left;
}

.parent-link:hover {
  text-decoration: underline;
}

.parent-link .pi {
  font-size: 0.75rem;
}
</style>
