<template>
  <div class="case-series">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <div class="controls-row">
        <div>
          <label class="field-label">Database</label>
          <Dropdown
            v-model="selectedDatabase"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            class="w-full"
          />
        </div>
        <div>
          <label class="field-label">Time-at-risk</label>
          <Dropdown
            v-model="selectedTar"
            :options="tarOptions"
            class="w-full"
            :disabled="!tarOptions.length"
          />
        </div>
        <div>
          <label class="field-label">Outcome washout</label>
          <Dropdown
            v-model="selectedWashout"
            :options="washoutOptions"
            class="w-full"
            :disabled="!washoutOptions.length"
          />
        </div>
        <div class="control-action">
          <GenerateButton :disabled="generateDisabled" @click="generate" />
        </div>
      </div>
    </div>

    <ContextBar
      v-if="showResults"
      :items="[
        targetName,
        lastGeneratedConfig.outcomeName,
        lastGeneratedConfig.selectedDatabaseName,
        `TAR: ${lastGeneratedConfig.selectedTar}`,
        `Washout: ${lastGeneratedConfig.selectedWashout}d`,
      ]"
    />

    <p v-if="showResults && helpText" class="help-note">{{ helpText }}</p>

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="selectedColumns"
                  :options="csColumnOptions"
                />
              </div>
              <Button
                :icon="
                  showBinaryFilters ? 'pi pi-filter-slash' : 'pi pi-filter'
                "
                :severity="showBinaryFilters ? 'primary' : 'secondary'"
                text
                rounded
                class="filter-toggle-btn"
                :title="showBinaryFilters ? 'Hide filters' : 'Show filters'"
                @click="showBinaryFilters = !showBinaryFilters"
              />
            </div>
            <DataTable
              :value="filteredBinaryRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              :filterDisplay="showBinaryFilters ? 'row' : undefined"
              v-model:filters="binaryTableFilters"
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
                    header="Covariate"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('domain')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Domain"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('concept')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Concept"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('timeWindow')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Time Window"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('windowDays')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Window Days"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('subType')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Sub-type"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('detail')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Detail"
                    :rowspan="showBinaryFilters ? 3 : 2"
                  />
                  <Column
                    v-if="hasBinaryPhase('Before')"
                    :hidden="csBinaryGroupHidden"
                    header="Pre-exposure"
                    :colspan="csBinaryGroupColspan"
                    :pt="headerPt(phaseIndex.Before)"
                  />
                  <Column
                    v-if="hasBinaryPhase('During')"
                    :hidden="csBinaryGroupHidden"
                    header="Between exposure &amp; outcome"
                    :colspan="csBinaryGroupColspan"
                    :pt="headerPt(phaseIndex.During)"
                  />
                  <Column
                    v-if="hasBinaryPhase('After')"
                    :hidden="csBinaryGroupHidden"
                    header="Post-outcome"
                    :colspan="csBinaryGroupColspan"
                    :pt="headerPt(phaseIndex.After)"
                  />
                </Row>
                <Row>
                  <template v-if="hasBinaryPhase('Before')"
                    ><Column
                      :hidden="!selectedColumns.includes('counts')"
                      :pt="{
                        ...subPt(phaseIndex.Before),
                        headerContent: 'justify-end',
                      }"
                      header="No." /><Column
                      :hidden="!selectedColumns.includes('pct')"
                      :pt="{
                        ...subPt(phaseIndex.Before),
                        headerContent: 'justify-end',
                      }"
                      header="%"
                  /></template>
                  <template v-if="hasBinaryPhase('During')"
                    ><Column
                      :hidden="!selectedColumns.includes('counts')"
                      :pt="{
                        ...subPt(phaseIndex.During),
                        headerContent: 'justify-end',
                      }"
                      header="No." /><Column
                      :hidden="!selectedColumns.includes('pct')"
                      :pt="{
                        ...subPt(phaseIndex.During),
                        headerContent: 'justify-end',
                      }"
                      header="%"
                  /></template>
                  <template v-if="hasBinaryPhase('After')"
                    ><Column
                      :hidden="!selectedColumns.includes('counts')"
                      :pt="{
                        ...subPt(phaseIndex.After),
                        headerContent: 'justify-end',
                      }"
                      header="No." /><Column
                      :hidden="!selectedColumns.includes('pct')"
                      :pt="{
                        ...subPt(phaseIndex.After),
                        headerContent: 'justify-end',
                      }"
                      header="%"
                  /></template>
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
                :showFilterMenu="false"
                style="text-align: start"
              >
                <template #filter>
                  <Dropdown
                    v-model="binaryDropdownFilters.domain"
                    :options="binaryDomainOptions"
                    placeholder="All"
                    showClear
                    class="filter-dropdown"
                  />
                </template>
              </Column>
              <Column
                :hidden="!selectedColumns.includes('concept')"
                field="concept"
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
                :hidden="!selectedColumns.includes('timeWindow')"
                field="timeWindow"
                :showFilterMenu="false"
                style="text-align: start"
              >
                <template #filter>
                  <Dropdown
                    v-model="binaryDropdownFilters.timeWindow"
                    :options="timeWindowOptions"
                    placeholder="All"
                    showClear
                    class="filter-dropdown"
                  />
                </template>
              </Column>
              <Column
                :hidden="!selectedColumns.includes('windowDays')"
                field="windowDays"
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
                :hidden="!selectedColumns.includes('subType')"
                field="subType"
                :showFilterMenu="false"
                style="text-align: start"
              >
                <template #filter>
                  <Dropdown
                    v-model="binaryDropdownFilters.subType"
                    :options="binarySubTypeOptions"
                    placeholder="All"
                    showClear
                    class="filter-dropdown"
                  />
                </template>
              </Column>
              <Column
                :hidden="!selectedColumns.includes('detail')"
                field="detail"
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
              <template v-if="hasBinaryPhase('Before')">
                <Column
                  :hidden="!selectedColumns.includes('counts')"
                  style="text-align: end"
                  field="sumValue_Before"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex.Before)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCensored(data.sumValue_Before)"
                    />
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>

                <Column
                  :hidden="!selectedColumns.includes('pct')"
                  style="text-align: end"
                  field="averageValue_Before"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex.Before)"
                >
                  <template #body="{ data }">{{
                    formatPct(data.averageValue_Before)
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
              </template>
              <template v-if="hasBinaryPhase('During')">
                <Column
                  :hidden="!selectedColumns.includes('counts')"
                  style="text-align: end"
                  field="sumValue_During"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex.During)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCensored(data.sumValue_During)"
                    />
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('pct')"
                  style="text-align: end"
                  field="averageValue_During"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex.During)"
                >
                  <template #body="{ data }">{{
                    formatPct(data.averageValue_During)
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
              </template>
              <template v-if="hasBinaryPhase('After')">
                <Column
                  :hidden="!selectedColumns.includes('counts')"
                  style="text-align: end"
                  field="sumValue_After"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex.After)"
                >
                  <template #body="{ data }">
                    <CensoredCell :text="formatCensored(data.sumValue_After)" />
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('pct')"
                  style="text-align: end"
                  field="averageValue_After"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex.After)"
                >
                  <template #body="{ data }">{{
                    formatPct(data.averageValue_After)
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
              </template>
            </DataTable>
          </div>

          <div v-else-if="activeResultTab === 1">
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="selectedColumns"
                  :options="csColumnOptions"
                />
              </div>

              <Button
                :icon="
                  showContinuousFilters ? 'pi pi-filter-slash' : 'pi pi-filter'
                "
                :severity="showContinuousFilters ? 'primary' : 'secondary'"
                text
                rounded
                class="filter-toggle-btn"
                :title="showContinuousFilters ? 'Hide filters' : 'Show filters'"
                @click="showContinuousFilters = !showContinuousFilters"
              />
            </div>
            <DataTable
              :value="filteredContinuousRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              :filterDisplay="showContinuousFilters ? 'row' : undefined"
              v-model:filters="continuousTableFilters"
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
                    header="Covariate"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('domain')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Domain"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('concept')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Concept"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('timeWindow')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Time Window"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('windowDays')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Window Days"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('subType')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Sub-type"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('detail')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="Detail"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('covariateId')"
                    :pt="{ headerContent: 'justify-start' }"
                    header="ID"
                    :rowspan="showContinuousFilters ? 3 : 2"
                  />
                  <Column
                    v-if="hasContinuousPhase('Before')"
                    :hidden="csContGroupHidden"
                    header="Pre-exposure"
                    :colspan="csContGroupColspan"
                    :pt="headerPt(phaseIndex.Before)"
                  />
                  <Column
                    v-if="hasContinuousPhase('During')"
                    :hidden="csContGroupHidden"
                    header="Between exposure &amp; outcome"
                    :colspan="csContGroupColspan"
                    :pt="headerPt(phaseIndex.During)"
                  />
                  <Column
                    v-if="hasContinuousPhase('After')"
                    :hidden="csContGroupHidden"
                    header="Post-outcome"
                    :colspan="csContGroupColspan"
                    :pt="headerPt(phaseIndex.After)"
                  />
                </Row>
                <Row>
                  <template
                    v-for="(phase, i) in presentContinuousPhases"
                    :key="'ch-' + phase"
                  >
                    <Column
                      :hidden="!selectedColumns.includes('statCount')"
                      :pt="{
                        ...subPt(phaseIndex[phase]),
                        headerContent: 'justify-end',
                      }"
                      header="Count"
                    /><Column
                      :hidden="!selectedColumns.includes('min')"
                      :pt="{
                        ...subPt(phaseIndex[phase]),
                        headerContent: 'justify-end',
                      }"
                      header="Min"
                    /><Column
                      :hidden="!selectedColumns.includes('max')"
                      :pt="{
                        ...subPt(phaseIndex[phase]),
                        headerContent: 'justify-end',
                      }"
                      header="Max"
                    />
                    <Column
                      :hidden="!selectedColumns.includes('mean')"
                      :pt="{
                        ...subPt(phaseIndex[phase]),
                        headerContent: 'justify-end',
                      }"
                      header="Mean"
                    /><Column
                      :hidden="!selectedColumns.includes('stdev')"
                      :pt="{
                        ...subPt(phaseIndex[phase]),
                        headerContent: 'justify-end',
                      }"
                      header="StDev"
                    /><Column
                      :hidden="!selectedColumns.includes('median')"
                      :pt="{
                        ...subPt(phaseIndex[phase]),
                        headerContent: 'justify-end',
                      }"
                      header="Median"
                    />
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
                :showFilterMenu="false"
                style="text-align: start"
              >
                <template #filter>
                  <Dropdown
                    v-model="continuousDropdownFilters.domain"
                    :options="continuousDomainOptions"
                    placeholder="All"
                    showClear
                    class="filter-dropdown"
                  />
                </template>
              </Column>
              <Column
                :hidden="!selectedColumns.includes('concept')"
                field="concept"
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
                :hidden="!selectedColumns.includes('timeWindow')"
                field="timeWindow"
                :showFilterMenu="false"
                style="text-align: start"
              >
                <template #filter>
                  <Dropdown
                    v-model="continuousDropdownFilters.timeWindow"
                    :options="timeWindowOptions"
                    placeholder="All"
                    showClear
                    class="filter-dropdown"
                  />
                </template>
              </Column>
              <Column
                :hidden="!selectedColumns.includes('windowDays')"
                field="windowDays"
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
                :hidden="!selectedColumns.includes('subType')"
                field="subType"
                :showFilterMenu="false"
                style="text-align: start"
              >
                <template #filter>
                  <Dropdown
                    v-model="continuousDropdownFilters.subType"
                    :options="continuousSubTypeOptions"
                    placeholder="All"
                    showClear
                    class="filter-dropdown"
                  />
                </template>
              </Column>
              <Column
                :hidden="!selectedColumns.includes('detail')"
                field="detail"
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
                :hidden="!selectedColumns.includes('covariateId')"
                style="text-align: start"
                field="covariateId"
                sortable
                :showFilterMenu="false"
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
              <template
                v-for="phase in presentContinuousPhases"
                :key="'cc-' + phase"
              >
                <Column
                  :hidden="!selectedColumns.includes('statCount')"
                  style="text-align: end"
                  :field="'countValue_' + phase"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex[phase])"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCensored(data['countValue_' + phase])"
                    />
                  </template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('min')"
                  style="text-align: end"
                  :field="'minValue_' + phase"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex[phase])"
                >
                  <template #body="{ data }">{{
                    formatNum(data["minValue_" + phase])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('max')"
                  style="text-align: end"
                  :field="'maxValue_' + phase"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex[phase])"
                >
                  <template #body="{ data }">{{
                    formatNum(data["maxValue_" + phase])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('mean')"
                  style="text-align: end"
                  :field="'averageValue_' + phase"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex[phase])"
                >
                  <template #body="{ data }">{{
                    formatNum(data["averageValue_" + phase])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('stdev')"
                  style="text-align: end"
                  :field="'standardDeviation_' + phase"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex[phase])"
                >
                  <template #body="{ data }">{{
                    formatNum(data["standardDeviation_" + phase])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :hidden="!selectedColumns.includes('median')"
                  style="text-align: end"
                  :field="'medianValue_' + phase"
                  sortable
                  :showFilterMenu="false"
                  :pt="bodyPt(phaseIndex[phase])"
                >
                  <template #body="{ data }">{{
                    formatNum(data["medianValue_" + phase])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
              </template>
            </DataTable>
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, database, TAR, and washout, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, toRef } from "vue";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import { useAvailableDatabases } from "../shared/useAvailableDatabases";
import { useTarWashout } from "../shared/useTarWashout";
import { formatCensored, formatPct, formatNum } from "@/shared/lib/formatters";
import { useGroupBanding } from "../shared/useGroupBanding";
import CensoredCell from "../shared/censoredCell";
import ColumnSelector from "@/shared/ui/columnSelector";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();
const STORAGE_KEY = "char:caseSeries";

const csColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "ID", key: "covariateId" },
  { label: "No.", key: "counts" },
  { label: "%", key: "pct" },
  { label: "Count", key: "statCount" },
  { label: "Min", key: "min" },
  { label: "Max", key: "max" },
  { label: "Mean", key: "mean" },
  { label: "StDev", key: "stdev" },
  { label: "Median", key: "median" },
];
const CS_DEFAULT_COLUMNS = [
  "covariateName",
  "pct",
  "statCount",
  "min",
  "max",
  "mean",
  "stdev",
  "median",
];
const selectedColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CS_DEFAULT_COLUMNS
);
watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const csBinaryGroupColspan = computed(() => {
  const n =
    (selectedColumns.value.includes("counts") ? 1 : 0) +
    (selectedColumns.value.includes("pct") ? 1 : 0);
  return n || 1;
});
const csBinaryGroupHidden = computed(
  () =>
    !selectedColumns.value.includes("counts") &&
    !selectedColumns.value.includes("pct")
);
const csContStatsKeys = ["statCount", "min", "max", "mean", "stdev", "median"];
const csContGroupColspan = computed(
  () =>
    csContStatsKeys.filter((k) => selectedColumns.value.includes(k)).length || 1
);
const csContGroupHidden = computed(
  () => !csContStatsKeys.some((k) => selectedColumns.value.includes(k))
);

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const showBinaryFilters = ref(false);
const showContinuousFilters = ref(false);
const loaderState = ref("idle");
const lastGeneratedConfig = ref(null);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "binary", label: "Binary Features" },
  { key: "continuous", label: "Continuous Features" },
];

const selectedOutcome = ref(null);
const selectedDatabase = ref(null);
const selectedTar = ref(null);
const selectedWashout = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const helpText = ref(null);
const binaryPhases = ref([]);
const continuousPhases = ref([]);

const binaryDropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });
const continuousDropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });

const binaryDomainOptions = computed(
  () =>
    [
      ...new Set(binaryRows.value.map((r: any) => r.domain).filter(Boolean)),
    ].sort() as string[]
);
const binarySubTypeOptions = computed(
  () =>
    [
      ...new Set(binaryRows.value.map((r: any) => r.subType).filter(Boolean)),
    ].sort() as string[]
);
const continuousDomainOptions = computed(
  () =>
    [
      ...new Set(
        continuousRows.value.map((r: any) => r.domain).filter(Boolean)
      ),
    ].sort() as string[]
);
const continuousSubTypeOptions = computed(
  () =>
    [
      ...new Set(
        continuousRows.value.map((r: any) => r.subType).filter(Boolean)
      ),
    ].sort() as string[]
);
const timeWindowOptions = ["temporal", "any_time_prior", "window"];

const filteredBinaryRows = computed(() => {
  let rows = binaryRows.value;
  if (binaryDropdownFilters.value.domain)
    rows = rows.filter(
      (r: any) => r.domain === binaryDropdownFilters.value.domain
    );
  if (binaryDropdownFilters.value.subType)
    rows = rows.filter(
      (r: any) => r.subType === binaryDropdownFilters.value.subType
    );
  if (binaryDropdownFilters.value.timeWindow)
    rows = rows.filter(
      (r: any) => r.timeWindow === binaryDropdownFilters.value.timeWindow
    );
  return rows;
});
const filteredContinuousRows = computed(() => {
  let rows = continuousRows.value;
  if (continuousDropdownFilters.value.domain)
    rows = rows.filter(
      (r: any) => r.domain === continuousDropdownFilters.value.domain
    );
  if (continuousDropdownFilters.value.subType)
    rows = rows.filter(
      (r: any) => r.subType === continuousDropdownFilters.value.subType
    );
  if (continuousDropdownFilters.value.timeWindow)
    rows = rows.filter(
      (r: any) => r.timeWindow === continuousDropdownFilters.value.timeWindow
    );
  return rows;
});

const binaryTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sumValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sumValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sumValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  minValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maxValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  standardDeviation_Before: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  medianValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  minValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maxValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  standardDeviation_During: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  medianValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  minValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maxValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  standardDeviation_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  medianValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));
const { tarOptions, tarValues, washoutOptions } =
  useTarWashout(selectedOutcome);

const { headerPt, subPt, bodyPt } = useGroupBanding();
const phaseIndex = { Before: 0, During: 1, After: 2 };

function hasBinaryPhase(phase) {
  return binaryPhases.value.includes(phase);
}
function hasContinuousPhase(phase) {
  return continuousPhases.value.includes(phase);
}
const presentContinuousPhases = computed(() =>
  ["Before", "During", "After"].filter((p) =>
    continuousPhases.value.includes(p)
  )
);

watch(selectedOutcome, () => {
  showResults.value = false;
  if (tarOptions.value.length) selectedTar.value = tarOptions.value[0];
  else selectedTar.value = null;
  if (washoutOptions.value.length)
    selectedWashout.value = washoutOptions.value[0];
  else selectedWashout.value = null;
});
watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
  }
);

async function fetchBinaryCaseSeries(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getBinaryCaseSeries({
    targetId,
    outcomeId,
    databaseId,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

async function fetchContinuousCaseSeries(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getContinuousCaseSeries({
    targetId,
    outcomeId,
    databaseId,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

async function fetchCaseCounts(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getCaseCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseId ? [databaseId] : undefined,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

function pivotBinary(raw) {
  const map = new Map();
  for (const r of raw) {
    const key = `${r.covariateId}|${r.minPriorObservation}|${r.outcomeWashoutDays}|${r.casePostOutcomeDuration}|${r.casePreTargetDuration}`;
    if (!map.has(key)) {
      map.set(key, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
        minPriorObservation: r.minPriorObservation,
        outcomeWashoutDays: r.outcomeWashoutDays,
        casePostOutcomeDuration: r.casePostOutcomeDuration,
        casePreTargetDuration: r.casePreTargetDuration,
      });
    }
    const row = map.get(key);
    const av = r.averageValue ?? 0;
    row[`sumValue_${r.type}`] =
      av < 0 ? -Math.abs(r.sumValue ?? 0) : r.sumValue ?? 0;
    row[`averageValue_${r.type}`] = av;
  }
  return [...map.values()];
}

function pivotContinuous(raw) {
  const map = new Map();
  for (const r of raw) {
    const key = `${r.covariateId}|${r.minPriorObservation}|${r.outcomeWashoutDays}|${r.casePostOutcomeDuration}|${r.casePreTargetDuration}`;
    if (!map.has(key)) {
      map.set(key, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
        minPriorObservation: r.minPriorObservation,
        outcomeWashoutDays: r.outcomeWashoutDays,
        casePostOutcomeDuration: r.casePostOutcomeDuration,
        casePreTargetDuration: r.casePreTargetDuration,
      });
    }
    const row = map.get(key);
    for (const f of [
      "countValue",
      "minValue",
      "maxValue",
      "averageValue",
      "standardDeviation",
      "medianValue",
    ]) {
      row[`${f}_${r.type}`] = r[f] ?? 0;
    }
  }
  return [...map.values()];
}

function detectPhases(rows, prefix) {
  const phases = [];
  for (const p of ["Before", "During", "After"]) {
    if (rows.some((r) => r[`${prefix}_${p}`] !== undefined)) phases.push(p);
  }
  return phases;
}

async function generate() {
  if (
    !selectedOutcome.value ||
    !selectedDatabase.value ||
    !selectedTar.value ||
    !selectedWashout.value
  ) {
    showResults.value = false;
    return;
  }

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetId = props.targetRow.cohortId;
    const outcomeId = selectedOutcome.value.cohortId;
    const databaseId = selectedDatabase.value;
    const tarIdx = tarOptions.value.indexOf(selectedTar.value);
    const tar = tarValues.value[tarIdx];

    if (!tar || !tar.startAnchor) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    const [rawBinary, rawContinuous, counts] = await Promise.all([
      fetchBinaryCaseSeries(targetId, outcomeId, databaseId, tar),
      fetchContinuousCaseSeries(targetId, outcomeId, databaseId, tar),
      fetchCaseCounts(targetId, outcomeId, databaseId, tar),
    ]);

    const pivotedBin = pivotBinary(rawBinary);
    const pivotedCont = pivotContinuous(rawContinuous);

    const minObs = pivotedBin[0]?.minPriorObservation;
    const postDur = pivotedBin[0]?.casePostOutcomeDuration;
    const preDur = pivotedBin[0]?.casePreTargetDuration;

    binaryRows.value = pivotedBin.filter(
      (r) =>
        r.minPriorObservation === minObs &&
        r.casePostOutcomeDuration === postDur &&
        r.casePreTargetDuration === preDur
    );
    continuousRows.value = pivotedCont.filter(
      (r) =>
        r.minPriorObservation === minObs &&
        r.casePostOutcomeDuration === postDur &&
        r.casePreTargetDuration === preDur
    );

    binaryPhases.value = detectPhases(binaryRows.value, "sumValue");
    continuousPhases.value = detectPhases(continuousRows.value, "countValue");

    const N = counts[0]?.personCount ?? "?";
    helpText.value = `Summary of ${N} cases: ${
      preDur ?? "?"
    }d before target index (pre-exposure), between target and outcome (during), and ${
      postDur ?? "?"
    }d after outcome (post-outcome). Min ${
      minObs ?? "?"
    }d prior observation required.`;

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    lastGeneratedConfig.value = {
      outcomeName: outcomeName.value,
      selectedDatabaseName: selectedDatabaseName.value,
      selectedOutcome: selectedOutcome?.value?.cohortId,
      selectedTar: selectedTar.value,
      selectedWashout: selectedWashout.value,
    };
    emit("state-change", {
      outcomeId: selectedOutcome.value.cohortId,
      databaseId: selectedDatabase.value,
      tar: selectedTar.value,
      washout: selectedWashout.value,
      databases: [selectedDatabaseName.value],
      ctxItems: [
        outcomeName.value,
        `TAR: ${selectedTar.value}`,
        `Washout: ${selectedWashout.value}d`,
      ],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const generateDisabled = computed(() => {
  if (
    !selectedTar.value ||
    !selectedDatabaseName.value ||
    !selectedOutcome.value ||
    !selectedWashout.value
  )
    return true;
  if (!lastGeneratedConfig.value) return false;
  return (
    selectedDatabaseName.value ===
      lastGeneratedConfig.value.selectedDatabaseName &&
    selectedOutcome.value.cohortId ===
      lastGeneratedConfig.value.selectedOutcome &&
    selectedTar.value === lastGeneratedConfig.value.selectedTar &&
    selectedWashout.value === lastGeneratedConfig.value.selectedWashout
  );
});

onMounted(async () => {
  const url = props.initialUrlState;
  if (url?.outcomeId && outcomeOptions.value.length) {
    const match = outcomeOptions.value.find(
      (o) => o.cohortId === url.outcomeId
    );
    if (match) selectedOutcome.value = match;
  }
  if (
    url?.databaseId &&
    availableDatabases.value.some((d) => d.id === url.databaseId)
  ) {
    selectedDatabase.value = url.databaseId;
  }
  await nextTick();
  if (url?.tar && tarOptions.value.includes(url.tar))
    selectedTar.value = url.tar;
  if (url?.washout && washoutOptions.value.includes(url.washout))
    selectedWashout.value = url.washout;
  await nextTick();
  if (
    selectedOutcome.value &&
    selectedDatabase.value &&
    selectedTar.value &&
    selectedWashout.value
  ) {
    await generate();
  }
});
</script>

<style scoped>
@import "../shared/styles.css";

.case-series {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.controls-row > div {
  min-width: 160px;
}

.help-note {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: 0 0.25rem;
  margin: 0;
  line-height: 1.4;
}

.table-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.col-selector {
  min-width: 200px;
  flex: 1 1 400px;
}

.filter-toggle-btn {
  flex-shrink: 0;
  margin-bottom: 2px;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1rem;
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
  font-size: 0.75rem;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
