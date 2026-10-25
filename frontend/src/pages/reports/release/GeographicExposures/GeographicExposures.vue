<template>
  <div v-if="manifest" class="flex flex-col gap-5">
    <PageHeader title="Geographic Exposures" />

    <Panel header="Layers">
      <div class="flex flex-row flex-wrap gap-6 items-end">
        <div v-if="manifest.levels.length > 1" class="flex flex-col gap-1">
          <label class="text-sm">Region level</label>
          <SelectButton
            v-model="level"
            :options="levelOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm">Color layer (choropleth)</label>
          <Dropdown
            v-model="baseId"
            :options="concepts"
            option-label="EXPOSURE_NAME"
            option-value="EXPOSURE_CONCEPT_ID"
            class="w-96"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm">Bubble layers</label>
          <MultiSelect
            v-model="overlayIds"
            :options="overlayOptions"
            option-label="EXPOSURE_NAME"
            option-value="EXPOSURE_CONCEPT_ID"
            :max-selected-labels="1"
            placeholder="None"
            class="w-72"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm">Statistic</label>
          <SelectButton
            v-model="stat"
            :options="statOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>
      </div>
      <div class="flex flex-row items-center gap-4 mt-6">
        <Button
          :icon="playing ? 'pi pi-pause' : 'pi pi-play'"
          rounded
          text
          :aria-label="playing ? 'Pause' : 'Play'"
          @click="togglePlay"
        />
        <Slider
          v-model="period"
          :min="manifest.periodMin"
          :max="manifest.periodMax"
          :step="1"
          class="flex-1"
        />
        <span class="text-lg w-16 text-right">{{ period }}</span>
      </div>
    </Panel>

    <Panel :header="mapTitle">
      <div v-if="loading" class="flex justify-center p-10">Loading…</div>
      <div v-else-if="loadError" class="p-6">{{ loadError }}</div>
      <template v-else>
        <Button
          label="Reset view"
          icon="pi pi-refresh"
          text
          size="small"
          class="mb-2"
          @click="viewResetKey += 1"
        />
        <GeoChart
          :option="mapOption"
          :map="
            boundaries
              ? { name: boundaries.mapName, geoJson: boundaries.geoJson }
              : null
          "
          :reset-key="viewResetKey"
          height="560px"
          @region-click="selectRegion"
        />
        <p class="text-sm mt-2 opacity-80">
          <template v-if="boundaries">
            Grey areas have no data<template v-if="manifest.minCellCount > 1">
              or fewer than {{ manifest.minCellCount }} persons
              (suppressed)</template
            >.
          </template>
          <template v-else>
            No boundary file is available for this release, so regions are drawn
            at their centroids.
          </template>
          Statistics describe person-level annual means. Scroll to zoom, drag to
          pan, click a region for detail.
        </p>
      </template>
    </Panel>

    <Panel v-if="selectedRegion && baseConcept" :header="detailTitle">
      <div class="flex flex-row flex-wrap gap-6">
        <div class="flex-1 min-w-96">
          <h3 class="mb-2">{{ baseConcept.EXPOSURE_NAME }} over time</h3>
          <GeoChart :option="trendOption" height="260px" />
        </div>
        <div class="flex-1 min-w-96">
          <h3 class="mb-2">All exposures in {{ period }}</h3>
          <DataTable
            :value="detailRows"
            size="small"
            :striped-rows="store.getters.getSettings.strippedRows"
          >
            <Column field="name" header="Exposure" />
            <Column header="Persons" style="text-align: end">
              <template #body="{ data }">{{ data.persons }}</template>
            </Column>
            <Column :header="STAT_LABELS[stat]" style="text-align: end">
              <template #body="{ data }">{{ data.value }}</template>
            </Column>
          </DataTable>
          <p v-if="residentCount !== null" class="text-sm mt-2">
            Persons resident in {{ period }}: {{ residentCount }}
          </p>
        </div>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";
import SelectButton from "primevue/selectbutton";
import Slider from "primevue/slider";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import PageHeader from "@/shared/ui/pageHeader";
import { PALETTE } from "@/shared/lib/chartColors";
import { GEO_MANIFEST } from "@/shared/config/files";
import GeoChart from "./GeoChart.vue";
import {
  loadBoundaries,
  loadExposureConcepts,
  loadRegions,
  loadResidency,
  loadSummary,
} from "./model/geoData";
import {
  buildMapOption,
  buildTrendOption,
  formatValue,
  STAT_LABELS,
} from "./model/mapOption";
import type {
  GeoBoundaries,
  GeoExposureConcept,
  GeoLevel,
  GeoManifest,
  GeoRegion,
  GeoResidencyRow,
  GeoStat,
  GeoSummaryRow,
} from "./model/types";

const store = useStore();
const route = useRoute();

const manifest = computed<GeoManifest | null>(
  () => store.getters.getData?.[GEO_MANIFEST] ?? null,
);
const dark = computed(() => !!store.getters.getSettings.darkMode);
const release = computed(() => ({
  cdm: String(route.params.cdm),
  release: String(route.params.release),
}));

const levelOptions = computed(() =>
  (manifest.value?.levels ?? []).map((l) => ({
    label: LEVEL_LABELS[l],
    value: l,
  })),
);
const LEVEL_LABELS: Record<GeoLevel, string> = {
  county: "County",
  state: "State",
  country: "Country",
};
const statOptions: { label: string; value: GeoStat }[] = [
  { label: "Mean", value: "MEAN_VALUE" },
  { label: "Median", value: "MEDIAN_VALUE" },
  { label: "P90", value: "P90_VALUE" },
];

const level = ref<GeoLevel>("county");
const stat = ref<GeoStat>("MEAN_VALUE");
const baseId = ref<number | null>(null);
const overlayIds = ref<number[]>([]);
const period = ref(0);
const playing = ref(false);
const viewResetKey = ref(0);
const selectedRegion = ref<string | null>(null);

const loading = ref(true);
const loadError = ref<string | null>(null);
const concepts = ref<GeoExposureConcept[]>([]);
const regions = shallowRef(new Map<string, GeoRegion>());
const boundaries = shallowRef<GeoBoundaries | null>(null);
// concept id -> period -> region id -> row
const summary = shallowRef(
  new Map<number, Map<number, Map<string, GeoSummaryRow>>>(),
);
const residency = shallowRef(new Map<string, Map<number, GeoResidencyRow>>());

const overlayOptions = computed(() =>
  concepts.value.filter((c) => c.EXPOSURE_CONCEPT_ID !== baseId.value),
);
const baseConcept = computed(
  () =>
    concepts.value.find((c) => c.EXPOSURE_CONCEPT_ID === baseId.value) ?? null,
);

function layerFor(concept: GeoExposureConcept, color?: string) {
  return {
    concept,
    color,
    rows:
      summary.value.get(concept.EXPOSURE_CONCEPT_ID)?.get(period.value) ??
      new Map<string, GeoSummaryRow>(),
  };
}

const mapOption = computed(() =>
  buildMapOption({
    boundaries: boundaries.value,
    regions: regions.value,
    base: baseConcept.value ? layerFor(baseConcept.value) : null,
    overlays: overlayIds.value
      .map((id) => concepts.value.find((c) => c.EXPOSURE_CONCEPT_ID === id))
      .filter(Boolean)
      .map((c, i) => layerFor(c!, PALETTE[(i + 1) % PALETTE.length])),
    stat: stat.value,
    minCellCount: manifest.value?.minCellCount ?? 0,
    dark: dark.value,
  }),
);

const mapTitle = computed(() =>
  baseConcept.value
    ? `${baseConcept.value.EXPOSURE_NAME} — ${STAT_LABELS[stat.value].toLowerCase()}, ${period.value}`
    : "Map",
);

const selectedRegionName = computed(
  () =>
    regions.value.get(selectedRegion.value ?? "")?.REGION_NAME ??
    selectedRegion.value,
);
const detailTitle = computed(() => `${selectedRegionName.value}`);

const trendOption = computed(() => {
  if (!baseConcept.value || !selectedRegion.value) return {};
  const rows: GeoSummaryRow[] = [];
  summary.value
    .get(baseConcept.value.EXPOSURE_CONCEPT_ID)
    ?.forEach((byRegion) => {
      const row = byRegion.get(selectedRegion.value!);
      if (row) rows.push(row);
    });
  return buildTrendOption({
    concept: baseConcept.value,
    rows,
    stat: stat.value,
    period: period.value,
    dark: dark.value,
  });
});

const detailRows = computed(() =>
  concepts.value.map((c) => {
    const row = summary.value
      .get(c.EXPOSURE_CONCEPT_ID)
      ?.get(period.value)
      ?.get(selectedRegion.value ?? "");
    return {
      name: c.EXPOSURE_NAME,
      persons: !row
        ? "no data"
        : row.SUPPRESSED
          ? "suppressed"
          : row.N_PERSONS?.toLocaleString(),
      value: row && !row.SUPPRESSED ? formatValue(row[stat.value]) : "–",
    };
  }),
);

const residentCount = computed(() => {
  const row = residency.value
    .get(selectedRegion.value ?? "")
    ?.get(period.value);
  if (!row) return null;
  return row.N_PERSONS_RESIDENT === null
    ? `fewer than ${manifest.value?.minCellCount}`
    : row.N_PERSONS_RESIDENT.toLocaleString();
});

function selectRegion(id: string) {
  selectedRegion.value = id;
}

function index(rows: GeoSummaryRow[]) {
  const out = new Map<number, Map<number, Map<string, GeoSummaryRow>>>();
  for (const row of rows) {
    let byPeriod = out.get(row.EXPOSURE_CONCEPT_ID);
    if (!byPeriod) out.set(row.EXPOSURE_CONCEPT_ID, (byPeriod = new Map()));
    let byRegion = byPeriod.get(row.PERIOD);
    if (!byRegion) byPeriod.set(row.PERIOD, (byRegion = new Map()));
    byRegion.set(row.REGION_ID, row);
  }
  return out;
}

async function load() {
  const m = manifest.value;
  if (!m) return;
  loading.value = true;
  loadError.value = null;
  selectedRegion.value = null;
  try {
    const ref = release.value;
    const lvl = level.value;
    const [conceptRows, regionRows, summaryRows, residencyRows, bounds] =
      await Promise.all([
        concepts.value.length
          ? Promise.resolve(concepts.value)
          : loadExposureConcepts(ref),
        loadRegions(ref, lvl),
        loadSummary(ref, lvl),
        m.hasResidency
          ? loadResidency(ref, lvl)
          : Promise.resolve([] as GeoResidencyRow[]),
        loadBoundaries(ref, m, lvl).catch(() => null),
      ]);
    concepts.value = conceptRows;
    regions.value = new Map(
      regionRows.map((r) => [
        r.REGION_ID,
        {
          ...r,
          // exports that only carry codes (e.g. ISO country) borrow the boundary file's names
          REGION_NAME:
            r.REGION_NAME === r.REGION_ID
              ? (bounds?.names.get(r.REGION_ID) ?? r.REGION_NAME)
              : r.REGION_NAME,
        },
      ]),
    );
    summary.value = index(summaryRows);
    const res = new Map<string, Map<number, GeoResidencyRow>>();
    for (const r of residencyRows) {
      if (!res.has(r.REGION_ID)) res.set(r.REGION_ID, new Map());
      res.get(r.REGION_ID)!.set(r.PERIOD, r);
    }
    residency.value = res;
    boundaries.value = bounds;
    if (baseId.value === null && conceptRows.length) {
      baseId.value = conceptRows[0].EXPOSURE_CONCEPT_ID;
    }
  } catch (e) {
    loadError.value = `Geographic exposure files could not be read: ${(e as Error).message}`;
  } finally {
    loading.value = false;
  }
}

let timer: ReturnType<typeof setInterval> | null = null;
function stopPlaying() {
  playing.value = false;
  if (timer) clearInterval(timer);
  timer = null;
}
function togglePlay() {
  if (playing.value) return stopPlaying();
  const m = manifest.value!;
  playing.value = true;
  if (period.value >= m.periodMax) period.value = m.periodMin;
  timer = setInterval(() => {
    if (period.value >= m.periodMax) return stopPlaying();
    period.value += 1;
  }, 900);
}

// registered first so a level change made by the manifest watcher below triggers the load
watch(level, load);
watch(
  manifest,
  (m) => {
    if (!m) return;
    const previous = level.value;
    // finest level first: county, then state, then country
    level.value =
      (["county", "state", "country"] as GeoLevel[]).find((l) =>
        m.levels.includes(l),
      ) ?? m.levels[0];
    period.value = m.periodMax;
    if (previous === level.value) load(); // otherwise the level watcher loads
  },
  { immediate: true },
);
watch(baseId, () => {
  overlayIds.value = overlayIds.value.filter((id) => id !== baseId.value);
});
onBeforeUnmount(stopPlaying);
</script>
