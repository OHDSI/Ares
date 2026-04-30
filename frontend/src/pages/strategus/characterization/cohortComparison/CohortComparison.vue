<template>
  <div class="cohort-comparison">
    <div class="section">
      <label class="field-label">Comparator</label>
      <OutcomeSelector
        v-model="selectedComparator"
        :options="comparatorOptions"
      />

      <div class="controls-row">
        <div>
          <label class="field-label">Database</label>
          <Dropdown
            v-model="selectedDatabase"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            placeholder="Select database"
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
        `vs ${lastGeneratedConfig.comparator}`,
        lastGeneratedConfig.database,
      ]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="covRef.length">
              Fraction of patients ({{ covRef[0]?.minPriorObservation }}d prior
              obs.) with each binary feature.
            </p>
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="selectedBinaryColumns"
                  :options="ccBinaryColumnOptions"
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
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
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
                          placeholder="e.g. -365 to -1"
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
                    v-for="ref in covRef"
                    :key="'bhdr-' + ref.id"
                    :header="columnGroupLabel(ref)"
                    :hidden="ccBinaryGroupHidden"
                    :colspan="ccBinaryGroupColspan"
                    :pt="dbHeaderPt(ref.id)"
                  />
                  <Column
                    :hidden="
                      covRef.length !== 2 ||
                      !selectedBinaryColumns.includes('SMD')
                    "
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput
                          v-if="showBinaryFilters && binaryFilters.SMD"
                          :filterObj="binaryFilters.SMD"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="
                      covRef.length !== 2 ||
                      !selectedBinaryColumns.includes('absSMD')
                    "
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="showBinaryFilters ? 3 : 2"
                    sortField="absSMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>|SMD|</span>
                        <div class="smd-filter">
                          <Slider
                            v-model="binaryAbsSmdMin"
                            :min="0"
                            :max="smdMax"
                            :step="0.01"
                            class="smd-slider"
                          />
                          <span class="smd-val"
                            >≥ {{ binaryAbsSmdMin.toFixed(2) }}</span
                          >
                        </div>
                      </div>
                    </template>
                  </Column>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'bsub-' + ref.id">
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
                  <template v-for="ref in covRef" :key="'bflt-' + ref.id">
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
              <template v-for="ref in covRef" :key="'bcol-' + ref.id">
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
                <template #body="{ data }">{{ formatSmd(data.SMD) }}</template>
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
                :hidden="
                  covRef.length !== 2 ||
                  !selectedBinaryColumns.includes('absSMD')
                "
                style="text-align: end"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatSmd(data.absSMD)
                }}</template>
                <template #filter="{}">
                  <div class="smd-filter">
                    <Slider
                      v-model="binaryAbsSmdMin"
                      :min="0"
                      :max="smdMax"
                      :step="0.01"
                      class="smd-slider"
                    />
                    <span class="smd-val"
                      >≥ {{ binaryAbsSmdMin.toFixed(2) }}</span
                    >
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-if="activeResultTab === 1">
            <div v-if="covRef.length === 2" class="scatter-container">
              <Chart
                :data="binaryRows"
                :chartSpec="scatterChartSpec"
                id="cohort-comparison"
                height="500px"
              />
            </div>
            <p v-else class="table-note">
              Need exactly 2 cohorts with data to plot.
            </p>
          </div>
          <div v-if="activeResultTab === 2">
            <p class="table-note" v-if="covRef.length">
              Continuous feature distributions ({{
                covRef[0]?.minPriorObservation
              }}d prior obs.) across cohorts.
            </p>
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="selectedContinuousColumns"
                  :options="ccContinuousColumnOptions"
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
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
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
                          placeholder="e.g. -365 to -1"
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
                    v-for="ref in covRef"
                    :key="'chdr-' + ref.id"
                    :header="columnGroupLabel(ref)"
                    :hidden="ccContGroupHidden"
                    :colspan="ccContGroupColspan"
                    :pt="dbHeaderPt(ref.id)"
                  />
                  <Column
                    :hidden="
                      covRef.length !== 2 ||
                      !selectedContinuousColumns.includes('SMD')
                    "
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput
                          v-if="showContinuousFilters && continuousFilters.SMD"
                          :filterObj="continuousFilters.SMD"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="
                      covRef.length !== 2 ||
                      !selectedContinuousColumns.includes('absSMD')
                    "
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="showContinuousFilters ? 3 : 2"
                    sortField="absSMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>|SMD|</span>
                        <div class="smd-filter">
                          <Slider
                            v-model="continuousAbsSmdMin"
                            :min="0"
                            :max="smdMax"
                            :step="0.01"
                            class="smd-slider"
                          />
                          <span class="smd-val"
                            >≥ {{ continuousAbsSmdMin.toFixed(2) }}</span
                          >
                        </div>
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
              <template v-for="ref in covRef" :key="'ccol-' + ref.id">
                <Column
                  :hidden="!selectedContinuousColumns.includes('statCount')"
                  style="text-align: end"
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
                  style="text-align: end"
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
                  style="text-align: end"
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
                  style="text-align: end"
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
                  style="text-align: end"
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
                  style="text-align: end"
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
                style="text-align: end"
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{ formatSmd(data.SMD) }}</template>
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
                :hidden="
                  covRef.length !== 2 ||
                  !selectedContinuousColumns.includes('absSMD')
                "
                style="text-align: end"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatSmd(data.absSMD)
                }}</template>
                <template #filter="{}">
                  <div class="smd-filter">
                    <Slider
                      v-model="continuousAbsSmdMin"
                      :min="0"
                      :max="smdMax"
                      :step="0.01"
                      class="smd-slider"
                    />
                    <span class="smd-val"
                      >≥ {{ continuousAbsSmdMin.toFixed(2) }}</span
                    >
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div></Transition
      >
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select a comparator and database, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, toRef } from "vue";
import Chart from "@/widgets/echarts/echarts";
import { scatterChartSpec as buildScatterChartSpec } from "./chartSpec";

import FilterInput from "../shared/filterInput";
import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import { useAvailableDatabases } from "../shared/useAvailableDatabases";
import {
  formatPercentStat,
  formatCount,
  formatSmd,
  formatNumCensored,
} from "@/shared/lib/formatters";
import { useGroupBanding } from "../shared/useGroupBanding";
import CensoredCell from "../shared/censoredCell";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import ColumnSelector from "@/shared/ui/columnSelector";
import Slider from "primevue/slider";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const STORAGE_KEY_BINARY = "char:cohortComparison:binary";
const STORAGE_KEY_CONT = "char:cohortComparison:continuous";

const ccBinaryColumnOptions = [
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
  { label: "|SMD|", key: "absSMD" },
];
const CC_DEFAULT_BINARY = ["covariateName", "counts", "pct", "SMD", "absSMD"];
const selectedBinaryColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_BINARY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_BINARY]
    : CC_DEFAULT_BINARY
);
watch(selectedBinaryColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_BINARY]: val });
});

const ccContinuousColumnOptions = [
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
  { label: "|SMD|", key: "absSMD" },
];
const CC_DEFAULT_CONT = [
  "covariateName",
  "statCount",
  "mean",
  "stdev",
  "median",
  "min",
  "max",
  "SMD",
  "absSMD",
];
const selectedContinuousColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_CONT]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_CONT]
    : CC_DEFAULT_CONT
);
watch(selectedContinuousColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_CONT]: val });
});

const ccBinaryGroupColspan = computed(() => {
  const n =
    (selectedBinaryColumns.value.includes("counts") ? 1 : 0) +
    (selectedBinaryColumns.value.includes("pct") ? 1 : 0);
  return n || 1;
});
const ccBinaryGroupHidden = computed(
  () =>
    !selectedBinaryColumns.value.includes("counts") &&
    !selectedBinaryColumns.value.includes("pct")
);

const ccContStatsKeys = ["statCount", "mean", "stdev", "median", "min", "max"];
const ccContGroupColspan = computed(
  () =>
    ccContStatsKeys.filter((k) => selectedContinuousColumns.value.includes(k))
      .length || 1
);
const ccContGroupHidden = computed(
  () =>
    !ccContStatsKeys.some((k) => selectedContinuousColumns.value.includes(k))
);

const props = defineProps({
  targetRow: { type: Object },
  targetTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const showBinaryFilters = ref(false);
const showContinuousFilters = ref(false);
const loaderState = ref("idle");
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

const activeResultTab = ref(0);
const resultTabs = [
  { key: "binary", label: "Binary Table" },
  { key: "plot", label: "Binary Plot" },
  { key: "continuous", label: "Continuous Table" },
];

const selectedComparator = ref(null);
const selectedDatabase = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const covRef = ref([]);

const binaryAbsSmdMin = ref(0);
const continuousAbsSmdMin = ref(0);
const smdMax = ref(2);

const filteredBinaryRows = computed(() => {
  let rows = binaryRows.value;
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
  if (binaryAbsSmdMin.value > 0)
    rows = rows.filter((r) => (r.absSMD ?? 0) >= binaryAbsSmdMin.value);
  return rows;
});

const filteredContinuousRows = computed(() => {
  let rows = continuousRows.value;
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
  if (continuousAbsSmdMin.value > 0)
    rows = rows.filter((r) => (r.absSMD ?? 0) >= continuousAbsSmdMin.value);
  return rows;
});

const scatterChartSpec = ({ data }) =>
  buildScatterChartSpec({
    data,
    selectedDatabaseName: selectedDatabaseName.value,
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

watch(covRef, (newRefs) => {
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
    bin.absSMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
    cont.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
    cont.absSMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
  }
  binaryFilters.value = bin;
  continuousFilters.value = cont;
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
});

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const comparatorOptions = computed(() =>
  (props.targetTable ?? []).filter(
    (r) => r.cohortComparator === 1 && r.cohortId !== props.targetRow?.cohortId
  )
);

const targetName = computed(() => props.targetRow?.cohortName ?? "");
const comparatorName = computed(
  () => selectedComparator.value?.cohortName ?? ""
);
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

function columnGroupLabel(ref) {
  const role =
    ref.cohortId === props.targetRow?.cohortId ? "Target" : "Comparator";
  return `${role} (${ref.minPriorObservation}d prior, N=${ref.n})`;
}

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    binaryRows.value = [];
    continuousRows.value = [];
    covRef.value = [];
    selectedComparator.value = null;
  }
);

async function fetchBinaryData(targetIds, databaseId) {
  const res = await StrategusService.characterization.getCohortBinary(
    targetIds,
    [databaseId]
  );
  return res.data;
}

async function fetchContinuousData(targetIds, databaseId) {
  const res = await StrategusService.characterization.getCohortContinuous(
    targetIds,
    [databaseId]
  );
  return res.data;
}

async function generate() {
  if (
    !selectedComparator.value ||
    !selectedDatabase.value ||
    !props.targetRow
  ) {
    showResults.value = false;
    return;
  }

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetIds = [
      props.targetRow.cohortId,
      selectedComparator.value.cohortId,
    ];
    const dbId = selectedDatabase.value;

    const binaryResult = await fetchBinaryData(targetIds, dbId);

    if (!binaryResult.covRef?.length || binaryResult.covRef.length < 2) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    covRef.value = binaryResult.covRef;
    binaryRows.value = (binaryResult.covariates ?? []).map((r: any) => ({
      ...r,
      ...(r.covariateNameParsed ?? {}),
    }));

    const continuousResult = await fetchContinuousData(targetIds, dbId);
    continuousRows.value = (continuousResult.covariates ?? []).map(
      (r: any) => ({ ...r, ...(r.covariateNameParsed ?? {}) })
    );

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    lastGeneratedConfig.value = {
      database: selectedDatabaseName.value,
      comparator: comparatorName.value,
    };
    showResults.value = true;

    emit("state-change", {
      comparatorId: selectedComparator.value.cohortId,
      databaseId: selectedDatabase.value,
      databases: [selectedDatabaseName.value],
      ctxItems: [`vs ${comparatorName.value}`],
    });

    binaryAbsSmdMin.value = 0;
    continuousAbsSmdMin.value = 0;
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const generateDisabled = computed(() => {
  if (!selectedComparator.value) return true;
  if (!selectedDatabaseName.value) return true;
  if (!lastGeneratedConfig.value) return false;
  return (
    comparatorName.value === lastGeneratedConfig.value.comparator &&
    selectedDatabaseName.value === lastGeneratedConfig.value.database
  );
});

onMounted(async () => {
  const url = props.initialUrlState;
  await nextTick();

  if (
    url?.databaseId &&
    availableDatabases.value.some((d) => d.id === url.databaseId)
  ) {
    selectedDatabase.value = url.databaseId;
  }

  if (url?.comparatorId && comparatorOptions.value.length) {
    const match = comparatorOptions.value.find(
      (c) => c.cohortId === url.comparatorId
    );
    if (match) selectedComparator.value = match;
  }

  if (selectedDatabase.value && selectedComparator.value) {
    await generate();
  }
});
</script>

<style scoped>
@import "../shared/styles.css";

.cohort-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
}

.controls-row > div:first-child {
  min-width: 250px;
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
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
}
:deep(.filter-dropdown .p-dropdown-trigger) {
  width: 1.5rem;
}
</style>
