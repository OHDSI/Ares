<template>
  <div>
    <TableToolbar
      v-model:search="search"
      v-model:columns="selectedColumns"
      :column-options="rfColumnOptions"
      v-model:show-filters="showFilters"
      v-model:fullscreen="localFullscreen"
      :table-ref="tableRef"
      :rows="filteredRows"
      filename="risk-factors-continuous"
    >
      <div class="smd-threshold">
        <span class="smd-label">|SMD| ≥</span>
        <div class="smd-filter">
          <Slider
            v-model="absSmdMin"
            :min="0"
            :max="smdMax"
            :step="0.01"
            class="smd-slider"
          />
          <span class="smd-val">
            {{ absSmdMin.toFixed(2) }}
          </span>
        </div>
      </div>
    </TableToolbar>
    <DataTable
      ref="tableRef"
      :value="filteredRows"
      :paginator="true"
      :rows="25"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="{first}–{last} of {totalRecords}"
      v-model:filters="globalFilter"
      :globalFilterFields="[
        'covariateName',
        'domain',
        'concept',
        'timeWindow',
        'windowDays',
        'subType',
        'detail',
      ]"
      sortMode="multiple"
      removableSort
      :striped-rows="store.getters.getSettings.strippedRows"
      size="small"
      class="result-table"
    >
      <ColumnGroup type="header">
        <Row>
          <Column
            :hidden="!selectedColumns.includes('covariateName')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="covariateName"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Covariate</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.covariateName"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('domain')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="domain"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Domain</span>
                <Dropdown
                  v-if="showFilters"
                  v-model="dropdownFilters.domain"
                  :options="domainOptions"
                  placeholder="All"
                  showClear
                  class="filter-dropdown"
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('concept')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="concept"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Concept</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.concept"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('timeWindow')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="timeWindow"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Time Window</span>
                <Dropdown
                  v-if="showFilters"
                  v-model="dropdownFilters.timeWindow"
                  :options="timeWindowOptions"
                  placeholder="All"
                  showClear
                  class="filter-dropdown"
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('windowDays')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="windowDays"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Window Days</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.windowDays"
                  placeholder="e.g. -365 to -1"
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('subType')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="subType"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Sub-type</span>
                <Dropdown
                  v-if="showFilters"
                  v-model="dropdownFilters.subType"
                  :options="subTypeOptions"
                  placeholder="All"
                  showClear
                  class="filter-dropdown"
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('detail')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 4 : 3"
            sortField="detail"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Detail</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.detail"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            v-for="ref in rfRef"
            :key="'chdr-' + ref.id"
            :header="`${ref.databaseName} (Cases: ${formatCensored(
              ref.caseN
            )} · Target: ${formatCensored(ref.targetN)})`"
            :hidden="dbGroupHidden"
            :colspan="dbColspan"
            :pt="headerPt(ref.id)"
          />
        </Row>
        <Row>
          <template v-for="ref in rfRef" :key="'csub2-' + ref.id">
            <Column
              header="Case"
              :hidden="caseGroupHidden"
              :colspan="caseGroupColspan"
              :pt="headerPt(ref.id)"
            />
            <Column
              header="Target"
              :hidden="targetGroupHidden"
              :colspan="targetGroupColspan"
              :pt="headerPt(ref.id)"
            />
            <Column
              :hidden="!selectedColumns.includes('SMD')"
              header="SMD"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              :rowspan="showFilters ? 3 : 2"
              :sortField="'SMD_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('absSMD')"
              header="|SMD|"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              :rowspan="showFilters ? 3 : 2"
              :sortField="'absSMD_' + ref.id"
              sortable
            />
          </template>
        </Row>
        <Row>
          <template v-for="ref in rfRef" :key="'csub3-' + ref.id">
            <Column
              :hidden="!selectedColumns.includes('caseCount')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Count"
              :sortField="'caseCountValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('caseMean')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Mean"
              :sortField="'caseAverageValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('caseStdev')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="StDev"
              :sortField="'caseStandardDeviation_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('caseMedian')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Median"
              :sortField="'caseMedianValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('caseMin')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Min"
              :sortField="'caseMinValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('caseMax')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Max"
              :sortField="'caseMaxValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('targetCount')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Count"
              :sortField="'targetCountValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('targetMean')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Mean"
              :sortField="'targetAverageValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('targetStdev')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="StDev"
              :sortField="'targetStandardDeviation_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('targetMedian')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Median"
              :sortField="'targetMedianValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('targetMin')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Min"
              :sortField="'targetMinValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('targetMax')"
              :pt="{
                ...subPt(ref.id),
                headerContent: 'justify-end',
              }"
              header="Max"
              :sortField="'targetMaxValue_' + ref.id"
              sortable
            />
          </template>
        </Row>
        <Row v-if="showFilters">
          <template v-for="ref in rfRef" :key="'cflt-' + ref.id">
            <Column
              :hidden="!selectedColumns.includes('caseCount')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['caseCountValue_' + ref.id]"
                  :filterObj="tableFilters['caseCountValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('caseMean')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['caseAverageValue_' + ref.id]"
                  :filterObj="tableFilters['caseAverageValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('caseStdev')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['caseStandardDeviation_' + ref.id]"
                  :filterObj="tableFilters['caseStandardDeviation_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('caseMedian')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['caseMedianValue_' + ref.id]"
                  :filterObj="tableFilters['caseMedianValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('caseMin')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['caseMinValue_' + ref.id]"
                  :filterObj="tableFilters['caseMinValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('caseMax')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['caseMaxValue_' + ref.id]"
                  :filterObj="tableFilters['caseMaxValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('targetCount')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['targetCountValue_' + ref.id]"
                  :filterObj="tableFilters['targetCountValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('targetMean')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['targetAverageValue_' + ref.id]"
                  :filterObj="tableFilters['targetAverageValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('targetStdev')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['targetStandardDeviation_' + ref.id]"
                  :filterObj="tableFilters['targetStandardDeviation_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('targetMedian')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['targetMedianValue_' + ref.id]"
                  :filterObj="tableFilters['targetMedianValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('targetMin')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['targetMinValue_' + ref.id]"
                  :filterObj="tableFilters['targetMinValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('targetMax')"
              :pt="subPt(ref.id)"
            >
              <template #header
                ><FilterInput
                  v-if="tableFilters['targetMaxValue_' + ref.id]"
                  :filterObj="tableFilters['targetMaxValue_' + ref.id]"
                  input-style="width:100%"
              /></template>
            </Column>
          </template>
        </Row>
      </ColumnGroup>

      <Column
        :hidden="!selectedColumns.includes('covariateName')"
        field="covariateName"
        :showFilterMenu="false"
        style="text-align: start"
      >
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            placeholder="Search..."
            size="small"
          />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('domain')"
        field="domain"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('concept')"
        field="concept"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('timeWindow')"
        field="timeWindow"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('windowDays')"
        field="windowDays"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('subType')"
        field="subType"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('detail')"
        field="detail"
        style="text-align: start"
      />
      <template v-for="ref in rfRef" :key="'ccol-' + ref.id">
        <Column
          :hidden="!selectedColumns.includes('caseCount')"
          style="text-align: end"
          :field="'caseCountValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }"
            ><CensoredCell
              :text="formatCensored(data['caseCountValue_' + ref.id])"
          /></template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('caseMean')"
          style="text-align: end"
          :field="'caseAverageValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["caseAverageValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('caseStdev')"
          style="text-align: end"
          :field="'caseStandardDeviation_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["caseStandardDeviation_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('caseMedian')"
          style="text-align: end"
          :field="'caseMedianValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["caseMedianValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('caseMin')"
          style="text-align: end"
          :field="'caseMinValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["caseMinValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('caseMax')"
          style="text-align: end"
          :field="'caseMaxValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["caseMaxValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('targetCount')"
          style="text-align: end"
          :field="'targetCountValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }"
            ><CensoredCell
              :text="formatCensored(data['targetCountValue_' + ref.id])"
          /></template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('targetMean')"
          style="text-align: end"
          :field="'targetAverageValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["targetAverageValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('targetStdev')"
          style="text-align: end"
          :field="'targetStandardDeviation_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["targetStandardDeviation_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('targetMedian')"
          style="text-align: end"
          :field="'targetMedianValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["targetMedianValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('targetMin')"
          style="text-align: end"
          :field="'targetMinValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["targetMinValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('targetMax')"
          style="text-align: end"
          :field="'targetMaxValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["targetMaxValue_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('SMD')"
          style="text-align: end"
          :field="'SMD_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["SMD_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('absSMD')"
          style="text-align: end"
          :field="'absSMD_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNum(data["absSMD_" + ref.id])
          }}</template>
          <template #filter="{ filterModel, filterCallback }"
            ><InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Filter..."
              size="small"
          /></template>
        </Column>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { FilterMatchMode } from "primevue/api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import InputText from "primevue/inputtext";
import TableToolbar from "@/widgets/tableToolbar";
import FilterInput from "../../shared/filterInput";
import CensoredCell from "../../shared/censoredCell";
import { useGroupBanding } from "../../shared/useGroupBanding";
import { formatCensored, formatNum } from "@/shared/lib/formatters";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const props = defineProps<{
  data: any[];
  rfRef: { id: string; databaseName: string; caseN: number; targetN: number }[];
  isFullscreen: boolean;
  helpTextObs: number | null;
}>();

const emit = defineEmits<{
  "update:fullscreen": [value: boolean];
}>();

const localFullscreen = computed({
  get: () => props.isFullscreen,
  set: (val) => emit("update:fullscreen", val),
});

const store = useStore();
const {
  headerPt: bandHeaderPt,
  subPt: bandSubPt,
  bodyPt: bandBodyPt,
} = useGroupBanding();

const STORAGE_KEY = "char:riskFactors:continuous";

const rfColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "Case Count", key: "caseCount" },
  { label: "Case Mean", key: "caseMean" },
  { label: "Case StDev", key: "caseStdev" },
  { label: "Case Median", key: "caseMedian" },
  { label: "Case Min", key: "caseMin" },
  { label: "Case Max", key: "caseMax" },
  { label: "Target Count", key: "targetCount" },
  { label: "Target Mean", key: "targetMean" },
  { label: "Target StDev", key: "targetStdev" },
  { label: "Target Median", key: "targetMedian" },
  { label: "Target Min", key: "targetMin" },
  { label: "Target Max", key: "targetMax" },
  { label: "SMD", key: "SMD" },
  { label: "|SMD|", key: "absSMD" },
];

const RF_DEFAULT = [
  "covariateName",
  "caseMean",
  "caseStdev",
  "caseMedian",
  "targetMean",
  "targetStdev",
  "targetMedian",
  "absSMD",
];

const selectedColumns = ref<string[]>(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : RF_DEFAULT
);
watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const tableRef = ref(null);
const search = ref("");
const showFilters = ref(false);
const absSmdMin = ref(0);
const smdMax = ref(2);

const globalFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
watch(search, (val) => {
  globalFilter.value.global.value = val;
});

const tableFilters = ref<Record<string, any>>({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const dropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });

const timeWindowOptions = ["temporal", "any_time_prior", "window"];

const domainOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.domain).filter(Boolean)),
    ].sort() as string[]
);
const subTypeOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.subType).filter(Boolean)),
    ].sort() as string[]
);

watch(
  () => props.rfRef,
  (newRefs) => {
    const f: Record<string, any> = {
      covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
      concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
      windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
      detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
    for (const ref of newRefs) {
      for (const key of [
        "caseCountValue",
        "caseAverageValue",
        "caseStandardDeviation",
        "caseMedianValue",
        "caseMinValue",
        "caseMaxValue",
        "targetCountValue",
        "targetAverageValue",
        "targetStandardDeviation",
        "targetMedianValue",
        "targetMinValue",
        "targetMaxValue",
        "SMD",
        "absSMD",
      ]) {
        f[`${key}_${ref.id}`] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        };
      }
    }
    tableFilters.value = f;
    dropdownFilters.value = { domain: null, subType: null, timeWindow: null };
    absSmdMin.value = 0;
  },
  { immediate: true }
);

const dbIndexMap = computed(() => {
  const map: Record<string, number> = {};
  props.rfRef.forEach((ref, i) => {
    map[ref.id] = i;
  });
  return map;
});

const headerPt = (id: string) => bandHeaderPt(dbIndexMap.value[id] ?? 0);
const subPt = (id: string) => bandSubPt(dbIndexMap.value[id] ?? 0);
const bodyPt = (id: string) => bandBodyPt(dbIndexMap.value[id] ?? 0);

const caseKeys = [
  "caseCount",
  "caseMean",
  "caseStdev",
  "caseMedian",
  "caseMin",
  "caseMax",
];
const targetKeys = [
  "targetCount",
  "targetMean",
  "targetStdev",
  "targetMedian",
  "targetMin",
  "targetMax",
];

const caseGroupColspan = computed(
  () => caseKeys.filter((k) => selectedColumns.value.includes(k)).length || 1
);
const caseGroupHidden = computed(
  () => !caseKeys.some((k) => selectedColumns.value.includes(k))
);
const targetGroupColspan = computed(
  () => targetKeys.filter((k) => selectedColumns.value.includes(k)).length || 1
);
const targetGroupHidden = computed(
  () => !targetKeys.some((k) => selectedColumns.value.includes(k))
);
const dbColspan = computed(() => {
  const c = caseKeys.filter((k) => selectedColumns.value.includes(k)).length;
  const t = targetKeys.filter((k) => selectedColumns.value.includes(k)).length;
  const s =
    (selectedColumns.value.includes("SMD") ? 1 : 0) +
    (selectedColumns.value.includes("absSMD") ? 1 : 0);
  return c + t + s || 1;
});
const dbGroupHidden = computed(() => dbColspan.value === 0);

const filteredRows = computed(() => {
  let rows = props.data;
  for (const [key, filter] of Object.entries(tableFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  if (dropdownFilters.value.domain)
    rows = rows.filter((r: any) => r.domain === dropdownFilters.value.domain);
  if (dropdownFilters.value.subType)
    rows = rows.filter((r: any) => r.subType === dropdownFilters.value.subType);
  if (dropdownFilters.value.timeWindow)
    rows = rows.filter(
      (r: any) => r.timeWindow === dropdownFilters.value.timeWindow
    );
  if (absSmdMin.value > 0) {
    rows = rows.filter((r) =>
      props.rfRef.some((ref) => (r[`absSMD_${ref.id}`] ?? 0) >= absSmdMin.value)
    );
  }
  return rows;
});
</script>

<style scoped>
@import "../../shared/styles.css";

.smd-threshold {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.smd-label {
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.smd-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.smd-slider {
  flex: 1;
  min-width: 70px;
}

.smd-val {
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.col-header-with-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

:deep(.p-sortable-column-icon) {
  opacity: 0.15;
  transition: opacity 0.15s;
}
:deep(.p-sortable-column:hover .p-sortable-column-icon),
:deep(.p-highlight .p-sortable-column-icon) {
  opacity: 1;
}

.filter-dropdown {
  width: 100%;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
}
:deep(.filter-dropdown .p-dropdown-trigger) {
  width: 1.5rem;
}
</style>
