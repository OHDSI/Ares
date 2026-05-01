<template>
  <div class="db-comparison">
    <div class="section">
      <div class="controls">
        <div class="control-databases">
          <label>Databases</label>
          <MultiSelect
            v-model="selectedDatabases"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            placeholder="Select databases"
            filter
            :pt="colSelectorPt"
            display="chip"
            class="w-full"
          />
        </div>
        <div class="control-threshold">
          <label>Threshold: {{ minThreshold }}</label>
          <Slider
            v-model="minThreshold"
            :min="minCharVal"
            :max="1"
            :step="0.01"
            class="w-full"
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
        lastGeneratedConfig.databases.join(', '),
        `Threshold ${lastGeneratedConfig.threshold}`,
      ]"
    />

    <div
      v-if="showResults"
      :class="[
        'section',
        'results-body',
        {
          'results-fullscreen': isFullscreen,
          'results-leaving': isFullscreenLeaving,
        },
      ]"
    >
      <div v-if="isFullscreen" class="section-header">
        <h3>Database Comparison</h3>
        <button
          class="fullscreen-btn"
          title="Exit fullscreen (Esc)"
          @click="exitFullscreen"
        >
          <SvgIcon :path="mdiFullscreenExit" :size="18" />
        </button>
      </div>
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="covRef.length">
              Fraction of patients ({{ covRef[0]?.minPriorObservation }}d prior
              obs.) with each binary feature.
            </p>
            <TableToolbar
              v-model:search="search"
              v-model:columns="selectedBinaryColumns"
              :column-options="dbBinaryColumnOptions"
              v-model:show-filters="showBinaryFilters"
              v-model:fullscreen="isFullscreen"
              :table-ref="binaryTableRef"
              :rows="filteredBinaryRows"
              filename="database-comparison-binary"
            />
            <DataTable
              ref="binaryTableRef"
              :value="filteredBinaryRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              v-model:filters="binaryGlobalFilter"
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
              :exportFilename="'database_comparison_binary'"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('covariateName')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          v-if="showBinaryFilters"
                          :filterObj="binaryFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('domain')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="domain"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Domain</span>
                        <Dropdown
                          v-if="showBinaryFilters"
                          v-model="binaryDropdownFilters.domain"
                          :options="binaryDomainOptions"
                          placeholder="All"
                          showClear
                          class="filter-dropdown"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('concept')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="concept"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Concept</span>
                        <FilterInput
                          v-if="showBinaryFilters"
                          :filterObj="binaryFilters.concept"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('timeWindow')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="timeWindow"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Time Window</span>
                        <Dropdown
                          v-if="showBinaryFilters"
                          v-model="binaryDropdownFilters.timeWindow"
                          :options="timeWindowOptions"
                          placeholder="All"
                          showClear
                          class="filter-dropdown"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('windowDays')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="windowDays"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Window Days</span>
                        <FilterInput
                          v-if="showBinaryFilters"
                          :filterObj="binaryFilters.windowDays"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('subType')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="subType"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Sub-type</span>
                        <Dropdown
                          v-if="showBinaryFilters"
                          v-model="binaryDropdownFilters.subType"
                          :options="binarySubTypeOptions"
                          placeholder="All"
                          showClear
                          class="filter-dropdown"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('detail')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="detail"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Detail</span>
                        <FilterInput
                          v-if="showBinaryFilters"
                          :filterObj="binaryFilters.detail"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedBinaryColumns.includes('covariateId')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="covariateId"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>ID</span>
                        <FilterInput
                          v-if="showBinaryFilters"
                          :filterObj="binaryFilters.covariateId"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-for="ref in covRef"
                    :key="'hdr-' + ref.id"
                    :header="`${ref.databaseName} (N=${ref.n})`"
                    :hidden="dbBinaryGroupHidden"
                    :colspan="dbBinaryGroupColspan"
                    :pt="dbHeaderPt(ref.id)"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    :hidden="
                      covRef.length !== 2 ||
                      !selectedBinaryColumns.includes('SMD')
                    "
                    :rowspan="3"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput
                          v-if="binaryFilters.SMD"
                          :filterObj="binaryFilters.SMD"
                        />
                      </div>
                    </template>
                  </Column>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'sub-' + ref.id">
                    <Column
                      :hidden="!selectedBinaryColumns.includes('counts')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="Count"
                      :sortField="'sumValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedBinaryColumns.includes('pct')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="%"
                      :sortField="'averageValue_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row v-if="showBinaryFilters">
                  <template v-for="ref in covRef" :key="'flt-' + ref.id">
                    <Column
                      :hidden="!selectedBinaryColumns.includes('counts')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryFilters['sumValue_' + ref.id]"
                          :filterObj="binaryFilters['sumValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedBinaryColumns.includes('pct')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryFilters['averageValue_' + ref.id]"
                          :filterObj="binaryFilters['averageValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                  </template>
                </Row>
              </ColumnGroup>

              <Column
                :hidden="!selectedBinaryColumns.includes('covariateName')"
                style="text-align: start"
                field="covariateName"
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
              <Column
                :hidden="!selectedBinaryColumns.includes('domain')"
                field="domain"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedBinaryColumns.includes('concept')"
                field="concept"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedBinaryColumns.includes('timeWindow')"
                field="timeWindow"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedBinaryColumns.includes('windowDays')"
                field="windowDays"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedBinaryColumns.includes('subType')"
                field="subType"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedBinaryColumns.includes('detail')"
                field="detail"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedBinaryColumns.includes('covariateId')"
                style="text-align: start"
                field="covariateId"
                sortable
                :showFilterMenu="false"
              />
              <template v-for="ref in covRef" :key="'col-' + ref.id">
                <Column
                  :hidden="!selectedBinaryColumns.includes('counts')"
                  style="text-align: end"
                  :field="'sumValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCount(data['sumValue_' + ref.id])"
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
                  :hidden="!selectedBinaryColumns.includes('pct')"
                  style="text-align: end"
                  :field="'averageValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatPercentStat(data['averageValue_' + ref.id])"
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
              </template>
              <Column
                :hidden="
                  covRef.length !== 2 || !selectedBinaryColumns.includes('SMD')
                "
                style="text-align: end"
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  data.SMD != null ? data.SMD.toFixed(4) : ""
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
            </DataTable>
          </div>
          <div v-else-if="activeResultTab === 1">
            <div class="plot-row" v-if="covRef.length >= 2">
              <div>
                <label>X-Axis</label>
                <Dropdown
                  v-model="plotXAxis"
                  :options="covRef"
                  optionLabel="databaseName"
                  optionValue="id"
                  class="w-full"
                />
              </div>
              <div>
                <label>Y-Axis</label>
                <Dropdown
                  v-model="plotYAxis"
                  :options="covRef"
                  optionLabel="databaseName"
                  optionValue="id"
                  class="w-full"
                />
              </div>
              <div class="plot-action">
                <Button label="Plot" @click="showPlot = true" size="small" />
              </div>
            </div>
            <div
              v-if="showPlot && covRef.length >= 2"
              class="scatter-container"
            >
              <Chart
                :data="binaryRows"
                :chart-spec="scatterChartSpec"
                id="db-comparison-scatter"
                height="500px"
              />
            </div>
            <p v-else-if="covRef.length < 2" class="table-note">
              Need at least 2 databases to plot.
            </p>
          </div>

          <div v-else-if="activeResultTab === 2">
            <p class="table-note" v-if="covRef.length">
              Continuous feature distributions ({{
                covRef[0]?.minPriorObservation
              }}d prior obs.) across databases.
            </p>
            <TableToolbar
              v-model:search="search"
              v-model:columns="selectedContinuousColumns"
              :column-options="dbContinuousColumnOptions"
              v-model:show-filters="showContinuousFilters"
              v-model:fullscreen="isFullscreen"
              :table-ref="continuousTableRef"
              :rows="filteredContinuousRows"
              filename="database-comparison-continuous"
            />
            <DataTable
              ref="continuousTableRef"
              :value="filteredContinuousRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              v-model:filters="continuousGlobalFilter"
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
              :exportFilename="'database_comparison_continuous'"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :hidden="
                      !selectedContinuousColumns.includes('covariateName')
                    "
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('domain')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="domain"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Domain</span>
                        <Dropdown
                          v-if="showContinuousFilters"
                          v-model="continuousDropdownFilters.domain"
                          :options="continuousDomainOptions"
                          placeholder="All"
                          showClear
                          class="filter-dropdown"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('concept')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="concept"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Concept</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousFilters.concept"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('timeWindow')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="timeWindow"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Time Window</span>
                        <Dropdown
                          v-if="showContinuousFilters"
                          v-model="continuousDropdownFilters.timeWindow"
                          :options="timeWindowOptions"
                          placeholder="All"
                          showClear
                          class="filter-dropdown"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('windowDays')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="windowDays"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Window Days</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousFilters.windowDays"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('subType')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="subType"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Sub-type</span>
                        <Dropdown
                          v-if="showContinuousFilters"
                          v-model="continuousDropdownFilters.subType"
                          :options="continuousSubTypeOptions"
                          placeholder="All"
                          showClear
                          class="filter-dropdown"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('detail')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="detail"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Detail</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousFilters.detail"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('covariateId')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="covariateId"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>ID</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousFilters.covariateId"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-for="ref in covRef"
                    :key="'chdr-' + ref.id"
                    :header="`${ref.databaseName} (N=${ref.n})`"
                    :hidden="dbContGroupHidden"
                    :colspan="dbContGroupColspan"
                    :pt="dbHeaderPt(ref.id)"
                  />
                  <Column
                    :hidden="
                      covRef.length !== 2 ||
                      !selectedContinuousColumns.includes('SMD')
                    "
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="3"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput
                          v-if="continuousFilters.SMD"
                          :filterObj="continuousFilters.SMD"
                        />
                      </div>
                    </template>
                  </Column>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'csub-' + ref.id">
                    <Column
                      :hidden="!selectedContinuousColumns.includes('statCount')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="Count"
                      :sortField="'countValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('mean')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="Mean"
                      :sortField="'averageValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('stdev')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="StDev"
                      :sortField="'standardDeviation_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('median')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="Median"
                      :sortField="'medianValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('min')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="Min"
                      :sortField="'minValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('max')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                      header="Max"
                      :sortField="'maxValue_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row v-if="showContinuousFilters">
                  <template v-for="ref in covRef" :key="'cflt-' + ref.id">
                    <Column
                      :hidden="!selectedContinuousColumns.includes('statCount')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['countValue_' + ref.id]"
                          :filterObj="continuousFilters['countValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('mean')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['averageValue_' + ref.id]"
                          :filterObj="
                            continuousFilters['averageValue_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('stdev')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="
                            continuousFilters['standardDeviation_' + ref.id]
                          "
                          :filterObj="
                            continuousFilters['standardDeviation_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('median')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['medianValue_' + ref.id]"
                          :filterObj="
                            continuousFilters['medianValue_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('min')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['minValue_' + ref.id]"
                          :filterObj="continuousFilters['minValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('max')"
                      :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['maxValue_' + ref.id]"
                          :filterObj="continuousFilters['maxValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                  </template>
                </Row>
              </ColumnGroup>

              <Column
                :hidden="!selectedContinuousColumns.includes('covariateName')"
                field="covariateName"
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
              <Column
                :hidden="!selectedContinuousColumns.includes('domain')"
                field="domain"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedContinuousColumns.includes('concept')"
                field="concept"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedContinuousColumns.includes('timeWindow')"
                field="timeWindow"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedContinuousColumns.includes('windowDays')"
                field="windowDays"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedContinuousColumns.includes('subType')"
                field="subType"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedContinuousColumns.includes('detail')"
                field="detail"
                style="text-align: start"
              />
              <Column
                :hidden="!selectedContinuousColumns.includes('covariateId')"
                field="covariateId"
                sortable
                :showFilterMenu="false"
              />
              <template v-for="ref in covRef" :key="'ccol-' + ref.id">
                <Column
                  :hidden="!selectedContinuousColumns.includes('statCount')"
                  :field="'countValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCount(data['countValue_' + ref.id])"
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
                  :hidden="!selectedContinuousColumns.includes('mean')"
                  :field="'averageValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNumCensored(data["averageValue_" + ref.id])
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
                  :hidden="!selectedContinuousColumns.includes('stdev')"
                  :field="'standardDeviation_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNumCensored(data["standardDeviation_" + ref.id])
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
                  :hidden="!selectedContinuousColumns.includes('median')"
                  :field="'medianValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNumCensored(data["medianValue_" + ref.id])
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
                  :hidden="!selectedContinuousColumns.includes('min')"
                  :field="'minValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNumCensored(data["minValue_" + ref.id])
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
                  :hidden="!selectedContinuousColumns.includes('max')"
                  :field="'maxValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="dbBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNumCensored(data["maxValue_" + ref.id])
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
              <Column
                :hidden="
                  covRef.length !== 2 ||
                  !selectedContinuousColumns.includes('SMD')
                "
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  data.SMD != null ? data.SMD.toFixed(4) : ""
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
            </DataTable>
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select at least 2 databases, then click Generate.
    </div>
    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  toRef,
} from "vue";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import MultiSelect from "primevue/multiselect";
import { colSelectorPt } from "../shared/colSelectorPt";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import Button from "primevue/button";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import TableToolbar from "@/widgets/tableToolbar";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";

import Chart from "@/widgets/echarts/echarts";
import FilterInput from "../shared/filterInput";
import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import ContextBar from "../shared/contextBar";
import { useAvailableDatabases } from "../shared/useAvailableDatabases";
import {
  formatPercentStat,
  formatCount,
  formatNumCensored,
} from "@/shared/lib/formatters";
import { classifyDomain, domainColors } from "../shared/domainColors";
import { useGroupBanding } from "../shared/useGroupBanding";
import CensoredCell from "../shared/censoredCell";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const STORAGE_KEY_BINARY = "char:dbComparison:binary";
const STORAGE_KEY_CONT = "char:dbComparison:continuous";

const dbBinaryColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "ID", key: "covariateId" },
  { label: "Count", key: "counts" },
  { label: "%", key: "pct" },
  { label: "SMD", key: "SMD" },
];
const DB_DEFAULT_BINARY = ["covariateName", "counts", "pct", "SMD"];
const selectedBinaryColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_BINARY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_BINARY]
    : DB_DEFAULT_BINARY
);
watch(selectedBinaryColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_BINARY]: val });
});

const dbContinuousColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "ID", key: "covariateId" },
  { label: "Count", key: "statCount" },
  { label: "Mean", key: "mean" },
  { label: "StDev", key: "stdev" },
  { label: "Median", key: "median" },
  { label: "Min", key: "min" },
  { label: "Max", key: "max" },
  { label: "SMD", key: "SMD" },
];
const DB_DEFAULT_CONT = [
  "covariateName",
  "statCount",
  "mean",
  "stdev",
  "median",
  "min",
  "max",
  "SMD",
];
const selectedContinuousColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_CONT]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_CONT]
    : DB_DEFAULT_CONT
);
watch(selectedContinuousColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_CONT]: val });
});

const dbBinaryGroupColspan = computed(() => {
  const n =
    (selectedBinaryColumns.value.includes("counts") ? 1 : 0) +
    (selectedBinaryColumns.value.includes("pct") ? 1 : 0);
  return n || 1;
});
const dbBinaryGroupHidden = computed(
  () =>
    !selectedBinaryColumns.value.includes("counts") &&
    !selectedBinaryColumns.value.includes("pct")
);

const dbContStatsKeys = ["statCount", "mean", "stdev", "median", "min", "max"];
const dbContGroupColspan = computed(
  () =>
    dbContStatsKeys.filter((k) => selectedContinuousColumns.value.includes(k))
      .length || 1
);
const dbContGroupHidden = computed(
  () =>
    !dbContStatsKeys.some((k) => selectedContinuousColumns.value.includes(k))
);

const props = defineProps({
  targetRow: { type: Object },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "binary", label: "Binary Table" },
  { key: "plot", label: "Binary Plot" },
  { key: "continuous", label: "Continuous Table" },
];

const loading = ref(false);
const showResults = ref(false);
const showBinaryFilters = ref(false);
const showContinuousFilters = ref(false);
const loaderState = ref("idle");
const showPlot = ref(false);

const binaryTableRef = ref(null);
const continuousTableRef = ref(null);
const isFullscreen = ref(false);
const isFullscreenLeaving = ref(false);

function exitFullscreen() {
  isFullscreenLeaving.value = true;
  setTimeout(() => {
    isFullscreen.value = false;
    isFullscreenLeaving.value = false;
  }, 230);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isFullscreen.value) exitFullscreen();
}

const minCharVal = ref(0);
const minThreshold = ref(0.01);
const selectedDatabases = ref([]);

const binaryRows = ref([]);
const continuousRows = ref([]);
const covRef = ref([]);

const plotXAxis = ref(null);
const plotYAxis = ref(null);

const search = ref("");
const binaryGlobalFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousGlobalFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  binaryGlobalFilter.value.global.value = val;
  continuousGlobalFilter.value.global.value = val;
});

const binaryFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

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
  for (const [key, filter] of Object.entries(binaryFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
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
  for (const [key, filter] of Object.entries(continuousFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  return rows;
});

watch(covRef, (newRefs) => {
  binaryDropdownFilters.value = {
    domain: null,
    subType: null,
    timeWindow: null,
  };
  continuousDropdownFilters.value = {
    domain: null,
    subType: null,
    timeWindow: null,
  };
  const bin = {
    covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
    windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
    detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
    covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  const cont = {
    covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
    windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
    detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
    covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  for (const ref of newRefs) {
    bin[`sumValue_${ref.id}`] = {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    };
    bin[`averageValue_${ref.id}`] = {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    };
    for (const f of [
      "countValue",
      "averageValue",
      "standardDeviation",
      "medianValue",
      "minValue",
      "maxValue",
    ]) {
      cont[`${f}_${ref.id}`] = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      };
    }
  }
  if (newRefs.length === 2) {
    bin.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
    cont.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
  }
  binaryFilters.value = bin;
  continuousFilters.value = cont;
});

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const targetName = computed(() => props.targetRow?.cohortName ?? "");

const selectedDatabaseNames = computed(() =>
  availableDatabases.value
    .filter((d) => selectedDatabases.value.includes(d.id))
    .map((d) => d.name)
);

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    binaryRows.value = [];
    continuousRows.value = [];
    covRef.value = [];
    showPlot.value = false;
  }
);

fetchMinThreshold();

async function fetchMinThreshold() {
  try {
    minCharVal.value = 0.01;
  } catch {
    minCharVal.value = 0;
  }
}

async function fetchBinaryData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortBinary(
    targetIds,
    databaseIds,
    threshold
  );
  return res.data;
}

async function fetchContinuousData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortContinuous(
    targetIds,
    databaseIds,
    threshold
  );
  return res.data;
}

async function generate() {
  showResults.value = false;
  if (!selectedDatabases.value.length || !props.targetRow) {
    showResults.value = false;
    return;
  }

  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetIds = [props.targetRow.cohortId];
    const dbIds = selectedDatabases.value;

    const binaryResult = await fetchBinaryData(
      targetIds,
      dbIds,
      minThreshold.value
    );

    if (!binaryResult.covRef?.length) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    covRef.value = binaryResult.covRef;
    binaryRows.value = binaryResult.covariates.map((r) => ({
      ...r,
      ...(r.covariateNameParsed ?? {}),
    }));

    if (covRef.value.length >= 2) {
      plotXAxis.value = covRef.value[0].id;
      plotYAxis.value = covRef.value[1].id;
    }

    const continuousResult = await fetchContinuousData(
      targetIds,
      dbIds,
      minThreshold.value
    );
    continuousRows.value = (continuousResult.covariates ?? []).map((r) => ({
      ...r,
      ...(r.covariateNameParsed ?? {}),
    }));

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    showPlot.value = false;

    lastGeneratedConfig.value = {
      databaseIds: [...selectedDatabases.value],
      databases: availableDatabases.value
        .filter((d) => selectedDatabases.value.includes(d.id))
        .map((d) => d.name),
      threshold: minThreshold.value,
    };
    emit("state-change", {
      databaseIds: selectedDatabases.value,
      databases: lastGeneratedConfig.value.databases,
      ctxItems: [`Threshold ${minThreshold.value}`],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const scatterChartSpec = computed(() => {
  const xId = plotXAxis.value;
  const yId = plotYAxis.value;

  return ({ data }) => {
    if (xId == null || yId == null || !data?.length) return {};

    const xField = `averageValue_${xId}`;
    const yField = `averageValue_${yId}`;
    const xRef = covRef.value.find((r) => r.id === xId);
    const yRef = covRef.value.find((r) => r.id === yId);

    const domainMap = {};
    for (const row of data) {
      const domain = classifyDomain(row.covariateName);
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push([
        row[xField] ?? 0,
        row[yField] ?? 0,
        row.covariateName,
      ]);
    }

    const series = Object.entries(domainMap).map(([domain, points]) => ({
      name: domain,
      type: "scatter",
      data: points,
      symbolSize: 8,
      itemStyle: { color: domainColors[domain] ?? "#999" },
    }));

    series.push({
      name: "x = y",
      type: "line",
      data: [
        [0, 0],
        [1, 1],
      ],
      symbol: "none",
      lineStyle: { type: "dashed", color: "#000", width: 1 },
      tooltip: { show: false },
    });

    return {
      legend: { right: 0, orient: "vertical", data: Object.keys(domainMap) },
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (params.seriesName === "x = y") return "";
          const [x, y, name] = params.data;
          return `<strong>${name}</strong><br/>${xRef?.databaseName}: ${(
            x * 100
          ).toFixed(1)}%<br/>${yRef?.databaseName}: ${(y * 100).toFixed(1)}%`;
        },
      },
      xAxis: {
        name: `${xRef?.databaseName ?? ""} %`,
        nameLocation: "center",
        nameGap: 30,
        min: 0,
        max: 1,
        axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
      },
      yAxis: {
        name: `${yRef?.databaseName ?? ""} %`,
        nameLocation: "center",
        nameGap: 40,
        min: 0,
        max: 1,
        axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
      },
      series,
    };
  };
});

const lastGeneratedConfig = ref(null);

const dbIndexMap = computed(() => {
  const map: Record<string, number> = {};
  covRef.value.forEach((ref, i) => {
    map[ref.id] = i;
  });
  return map;
});

const { headerPt, subPt, bodyPt } = useGroupBanding();
const dbHeaderPt = (id: string) => headerPt(dbIndexMap.value[id] ?? 0);
const dbSubPt = (id: string) => subPt(dbIndexMap.value[id] ?? 0);
const dbBodyPt = (id: string) => bodyPt(dbIndexMap.value[id] ?? 0);

const generateDisabled = computed(() => {
  if (selectedDatabases.value.length < 2) return true;
  if (!lastGeneratedConfig.value) return false;
  return (
    minThreshold.value === lastGeneratedConfig.value.threshold &&
    selectedDatabases.value.length ===
      lastGeneratedConfig.value.databaseIds.length &&
    selectedDatabases.value.every((id) =>
      lastGeneratedConfig.value.databaseIds.includes(id)
    )
  );
});

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  const url = props.initialUrlState;
  await nextTick();

  const dbs = availableDatabases.value;
  if (url?.databaseIds?.length) {
    const valid = url.databaseIds.filter((id) => dbs.some((d) => d.id === id));
    if (valid.length) selectedDatabases.value = valid;
  }

  if (selectedDatabases.value.length >= 2) {
    await generate();
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
@import "../shared/styles.css";

.db-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.controls label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-label);
}

.control-databases {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
  display: block;
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
  color: var(--color-text-label);
}

.control-threshold {
  min-width: 180px;
  max-width: 250px;
  align-self: center;
  font-size: 0.8125rem;
}

.plot-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  max-width: 500px;
  margin-bottom: 0.75rem;
}

.plot-row > div {
  flex: 1;
  min-width: 130px;
}

.plot-row label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-label);
}

.plot-action {
  flex: none !important;
  min-width: auto !important;
  padding-bottom: 1px;
}

.col-header-with-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.results-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1001;
  border-radius: 0;
  max-width: none;
  padding: 1.25rem 1.75rem;
  background: var(--color-bg-page);
  overflow-y: auto;
  animation: dc-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: dc-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes dc-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dc-fs-leave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
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
