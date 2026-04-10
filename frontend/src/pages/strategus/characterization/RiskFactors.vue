<template>
  <div class="risk-factors">
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

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="helpTextObs">
              Fraction of patients ({{ helpTextObs }}d prior obs.) stratified by
              outcome during time-at-risk.
            </p>
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <MultiSelect
                  v-model="selectedColumns"
                  :options="rfColumnOptions"
                  option-label="label"
                  option-value="key"
                  placeholder="Select columns"
                  display="chip"
                  :filter="true"
                  :pt="colSelectorPt"
                  class="w-full"
                />
              </div>
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
                    :hidden="!selectedColumns.includes('covariateName')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="3"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          :filterObj="binaryTableFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :header="`Case (N=${caseN})`"
                    :colspan="2"
                    :pt="headerPt(0)"
                  />
                  <Column
                    :header="`Non-Case (N=${nonCaseN})`"
                    :colspan="2"
                    :pt="headerPt(1)"
                  />
                  <Column
                    :hidden="!selectedColumns.includes('SMD')"
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="3"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput :filterObj="binaryTableFilters.SMD" />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('absSMD')"
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="3"
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
                  <Column
                    :hidden="!selectedColumns.includes('caseCount')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="Count"
                    sortField="caseCount"
                    sortable
                  />
                  <Column
                    :hidden="!selectedColumns.includes('caseAverage')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="%"
                    sortField="caseAverage"
                    sortable
                  />
                  <Column
                    :hidden="!selectedColumns.includes('nonCaseCount')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="Count"
                    sortField="nonCaseCount"
                    sortable
                  />
                  <Column
                    :hidden="!selectedColumns.includes('nonCaseAverage')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="%"
                    sortField="nonCaseAverage"
                    sortable
                  />
                </Row>
                <Row>
                  <Column
                    :hidden="!selectedColumns.includes('caseCount')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="binaryTableFilters.caseCount"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('caseAverage')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="binaryTableFilters.caseAverage"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('nonCaseCount')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="binaryTableFilters.nonCaseCount"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('nonCaseAverage')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="binaryTableFilters.nonCaseAverage"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
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
                :hidden="!selectedColumns.includes('caseCount')"
                style="text-align: end"
                field="caseCount"
                :pt="bodyPt(0)"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">
                  <CensoredCell :text="formatCensored(data.caseCount)" />
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
                :hidden="!selectedColumns.includes('caseAverage')"
                style="text-align: end"
                field="caseAverage"
                :pt="bodyPt(0)"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatPct(data.caseAverage)
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
                :hidden="!selectedColumns.includes('nonCaseCount')"
                style="text-align: end"
                field="nonCaseCount"
                :pt="bodyPt(1)"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">
                  <CensoredCell :text="formatCensored(data.nonCaseCount)" />
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
                :hidden="!selectedColumns.includes('nonCaseAverage')"
                style="text-align: end"
                field="nonCaseAverage"
                :pt="bodyPt(1)"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatPct(data.nonCaseAverage)
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
                :hidden="!selectedColumns.includes('SMD')"
                style="text-align: end"
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{ formatNum(data.SMD) }}</template>
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
                :hidden="!selectedColumns.includes('absSMD')"
                style="text-align: end"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatNum(data.absSMD)
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

          <div v-else-if="activeResultTab === 1">
            <p class="table-note" v-if="helpTextObs">
              Continuous feature distributions ({{ helpTextObs }}d prior obs.)
              stratified by outcome during time-at-risk.
            </p>
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <MultiSelect
                  v-model="selectedContinuousColumns"
                  :options="rfContinuousColumnOptions"
                  option-label="label"
                  option-value="key"
                  placeholder="Select columns"
                  display="chip"
                  :filter="true"
                  :pt="colSelectorPt"
                  class="w-full"
                />
              </div>
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
                    :rowspan="3"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          :filterObj="continuousTableFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :header="`Case (N=${caseN})`"
                    :hidden="rfCaseGroupHidden"
                    :colspan="rfCaseGroupColspan"
                    :pt="headerPt(0)"
                  />
                  <Column
                    :header="`Target (N=${targetN})`"
                    :hidden="rfTargetGroupHidden"
                    :colspan="rfTargetGroupColspan"
                    :pt="headerPt(1)"
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('SMD')"
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="3"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput :filterObj="continuousTableFilters.SMD" />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('absSMD')"
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="3"
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
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseCount')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="Count"
                    sortField="caseCountValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMin')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="Min"
                    sortField="caseMinValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMax')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="Max"
                    sortField="caseMaxValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMean')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="Mean"
                    sortField="caseAverageValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseStdev')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="StDev"
                    sortField="caseStandardDeviation"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMedian')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                    header="Median"
                    sortField="caseMedianValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetCount')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="Count"
                    sortField="targetCountValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetMin')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="Min"
                    sortField="targetMinValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetMax')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="Max"
                    sortField="targetMaxValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetMean')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="Mean"
                    sortField="targetAverageValue"
                    sortable
                  />
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetStdev')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="StDev"
                    sortField="targetStandardDeviation"
                    sortable
                  />
                  <Column
                    :hidden="
                      !selectedContinuousColumns.includes('targetMedian')
                    "
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                    header="Median"
                    sortField="targetMedianValue"
                    sortable
                  />
                </Row>
                <Row>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseCount')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.caseCountValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMin')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.caseMinValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMax')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.caseMaxValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMean')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.caseAverageValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseStdev')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="
                          continuousTableFilters.caseStandardDeviation
                        "
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('caseMedian')"
                    :pt="{ ...subPt(0), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.caseMedianValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetCount')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.targetCountValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetMin')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.targetMinValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetMax')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.targetMaxValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetMean')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.targetAverageValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('targetStdev')"
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="
                          continuousTableFilters.targetStandardDeviation
                        "
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                  <Column
                    :hidden="
                      !selectedContinuousColumns.includes('targetMedian')
                    "
                    :pt="{ ...subPt(1), headerContent: 'justify-end' }"
                  >
                    <template #header>
                      <FilterInput
                        :filterObj="continuousTableFilters.targetMedianValue"
                        input-style="width:100%"
                      />
                    </template>
                  </Column>
                </Row>
              </ColumnGroup>

              <Column
                :hidden="!selectedContinuousColumns.includes('covariateName')"
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
                :hidden="!selectedContinuousColumns.includes('caseCount')"
                style="text-align: end"
                field="caseCountValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(0)"
              >
                <template #body="{ data }">
                  <CensoredCell :text="formatCensored(data.caseCountValue)" />
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
                :hidden="!selectedContinuousColumns.includes('caseMin')"
                style="text-align: end"
                field="caseMinValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(0)"
              >
                <template #body="{ data }">{{
                  formatNum(data.caseMinValue)
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
                :hidden="!selectedContinuousColumns.includes('caseMax')"
                style="text-align: end"
                field="caseMaxValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(0)"
              >
                <template #body="{ data }">{{
                  formatNum(data.caseMaxValue)
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
                :hidden="!selectedContinuousColumns.includes('caseMean')"
                style="text-align: end"
                field="caseAverageValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(0)"
              >
                <template #body="{ data }">{{
                  formatNum(data.caseAverageValue)
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
                :hidden="!selectedContinuousColumns.includes('caseStdev')"
                style="text-align: end"
                field="caseStandardDeviation"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(0)"
              >
                <template #body="{ data }">{{
                  formatNum(data.caseStandardDeviation)
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
                :hidden="!selectedContinuousColumns.includes('caseMedian')"
                style="text-align: end"
                field="caseMedianValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(0)"
              >
                <template #body="{ data }">{{
                  formatNum(data.caseMedianValue)
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
                :hidden="!selectedContinuousColumns.includes('targetCount')"
                style="text-align: end"
                field="targetCountValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(1)"
              >
                <template #body="{ data }">
                  <CensoredCell :text="formatCensored(data.targetCountValue)" />
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
                :hidden="!selectedContinuousColumns.includes('targetMin')"
                style="text-align: end"
                field="targetMinValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(1)"
              >
                <template #body="{ data }">{{
                  formatNum(data.targetMinValue)
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
                :hidden="!selectedContinuousColumns.includes('targetMax')"
                style="text-align: end"
                field="targetMaxValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(1)"
              >
                <template #body="{ data }">{{
                  formatNum(data.targetMaxValue)
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
                :hidden="!selectedContinuousColumns.includes('targetMean')"
                style="text-align: end"
                field="targetAverageValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(1)"
              >
                <template #body="{ data }">{{
                  formatNum(data.targetAverageValue)
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
                :hidden="!selectedContinuousColumns.includes('targetStdev')"
                style="text-align: end"
                field="targetStandardDeviation"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(1)"
              >
                <template #body="{ data }">{{
                  formatNum(data.targetStandardDeviation)
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
                :hidden="!selectedContinuousColumns.includes('targetMedian')"
                style="text-align: end"
                field="targetMedianValue"
                sortable
                :showFilterMenu="false"
                :pt="bodyPt(1)"
              >
                <template #body="{ data }">{{
                  formatNum(data.targetMedianValue)
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
                :hidden="!selectedContinuousColumns.includes('SMD')"
                style="text-align: end"
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{ formatNum(data.SMD) }}</template>
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
                :hidden="!selectedContinuousColumns.includes('absSMD')"
                style="text-align: end"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatNum(data.absSMD)
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
      Select an outcome, database, TAR, and washout, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, toRef } from "vue";

import ResultsLoader from "./shared/ResultsLoader.vue";
import ViewToggle from "./shared/ViewToggle.vue";
import OutcomeSelector from "./shared/OutcomeSelector.vue";
import ContextBar from "./shared/ContextBar.vue";
import { useAvailableDatabases } from "./shared/useAvailableDatabases";
import { useTarWashout } from "./shared/useTarWashout";
import { formatCensored, formatPct, formatNum } from "./shared/formatters";
import { useGroupBanding } from "./shared/useGroupBanding";
import CensoredCell from "./shared/CensoredCell.vue";
import { colSelectorPt } from "./shared/colSelectorPt";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";
import Slider from "primevue/slider";
import GenerateButton from "@/pages/strategus/characterization/shared/GenerateButton.vue";
import InputText from "primevue/inputtext";
import FilterInput from "./shared/FilterInput.vue";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const smdValColor = computed(() => (darkMode.value ? "#9ca3af" : "#6b7280"));
const { headerPt, subPt, bodyPt } = useGroupBanding();

const STORAGE_KEY_BINARY = "char:riskFactors:binary";
const STORAGE_KEY_CONT = "char:riskFactors:continuous";

const rfColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Case Count", key: "caseCount" },
  { label: "Case %", key: "caseAverage" },
  { label: "Non-Case Count", key: "nonCaseCount" },
  { label: "Non-Case %", key: "nonCaseAverage" },
  { label: "SMD", key: "SMD" },
  { label: "|SMD|", key: "absSMD" },
];
const RF_DEFAULT_BINARY = [
  "covariateName",
  "caseCount",
  "caseAverage",
  "nonCaseCount",
  "nonCaseAverage",
  "absSMD",
];
const selectedColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_BINARY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_BINARY]
    : RF_DEFAULT_BINARY
);
watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_BINARY]: val });
});

const rfContinuousColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Case Count", key: "caseCount" },
  { label: "Case Min", key: "caseMin" },
  { label: "Case Max", key: "caseMax" },
  { label: "Case Mean", key: "caseMean" },
  { label: "Case StDev", key: "caseStdev" },
  { label: "Case Median", key: "caseMedian" },
  { label: "Target Count", key: "targetCount" },
  { label: "Target Min", key: "targetMin" },
  { label: "Target Max", key: "targetMax" },
  { label: "Target Mean", key: "targetMean" },
  { label: "Target StDev", key: "targetStdev" },
  { label: "Target Median", key: "targetMedian" },
  { label: "SMD", key: "SMD" },
  { label: "|SMD|", key: "absSMD" },
];
const RF_DEFAULT_CONT = [
  "covariateName",
  "caseCount",
  "caseMin",
  "caseMax",
  "caseMean",
  "caseStdev",
  "caseMedian",
  "targetCount",
  "targetMin",
  "targetMax",
  "targetMean",
  "targetStdev",
  "targetMedian",
  "absSMD",
];
const selectedContinuousColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_CONT]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_CONT]
    : RF_DEFAULT_CONT
);
watch(selectedContinuousColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_CONT]: val });
});

const rfCaseCols = [
  "caseCount",
  "caseMin",
  "caseMax",
  "caseMean",
  "caseStdev",
  "caseMedian",
];
const rfTargetCols = [
  "targetCount",
  "targetMin",
  "targetMax",
  "targetMean",
  "targetStdev",
  "targetMedian",
];
const rfCaseGroupColspan = computed(
  () =>
    rfCaseCols.filter((k) => selectedContinuousColumns.value.includes(k))
      .length || 1
);
const rfCaseGroupHidden = computed(
  () => !rfCaseCols.some((k) => selectedContinuousColumns.value.includes(k))
);
const rfTargetGroupColspan = computed(
  () =>
    rfTargetCols.filter((k) => selectedContinuousColumns.value.includes(k))
      .length || 1
);
const rfTargetGroupHidden = computed(
  () => !rfTargetCols.some((k) => selectedContinuousColumns.value.includes(k))
);

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
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
const caseN = ref(0);
const nonCaseN = ref(0);
const targetN = ref(0);
const helpTextObs = ref(null);

const binaryAbsSmdMin = ref(0);
const continuousAbsSmdMin = ref(0);
const smdMax = ref(2);

const binaryTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseCount: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseAverage: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nonCaseCount: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nonCaseAverage: { value: null, matchMode: FilterMatchMode.CONTAINS },
  SMD: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseCountValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseMinValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseMaxValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseAverageValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseStandardDeviation: { value: null, matchMode: FilterMatchMode.CONTAINS },
  caseMedianValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetCountValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetMinValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetMaxValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetAverageValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetStandardDeviation: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetMedianValue: { value: null, matchMode: FilterMatchMode.CONTAINS },
  SMD: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

const { tarOptions, tarValues, washoutOptions } =
  useTarWashout(selectedOutcome);

const filteredBinaryRows = computed(() => {
  let rows = binaryRows.value;
  for (const [key, filter] of Object.entries(binaryTableFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  if (binaryAbsSmdMin.value > 0)
    rows = rows.filter((r) => (r.absSMD ?? 0) >= binaryAbsSmdMin.value);
  return rows;
});

const filteredContinuousRows = computed(() => {
  let rows = continuousRows.value;
  for (const [key, filter] of Object.entries(continuousTableFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  if (continuousAbsSmdMin.value > 0)
    rows = rows.filter((r) => (r.absSMD ?? 0) >= continuousAbsSmdMin.value);
  return rows;
});

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

async function fetchCaseTargetCounts(targetId, outcomeId, databaseId) {
  const res = await StrategusService.characterization.getCaseTargetCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseId ? [databaseId] : undefined,
  });
  return res.data;
}

async function fetchBinaryRiskFactors(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getBinaryRiskFactors({
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

async function fetchContinuousRiskFactors(
  targetId,
  outcomeId,
  databaseId,
  tar
) {
  const res = await StrategusService.characterization.getContinuousRiskFactors({
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

    const [caseCounts, targetCounts, binary, continuous] = await Promise.all([
      fetchCaseCounts(targetId, outcomeId, databaseId, tar),
      fetchCaseTargetCounts(targetId, outcomeId, databaseId),
      fetchBinaryRiskFactors(targetId, outcomeId, databaseId, tar),
      fetchContinuousRiskFactors(targetId, outcomeId, databaseId, tar),
    ]);

    const washout = selectedWashout.value;
    const caseRow = caseCounts.find(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    const targetRow = targetCounts.find(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );

    caseN.value = caseRow?.personCount ?? 0;
    nonCaseN.value = targetRow?.personCount ?? 0;
    targetN.value = targetRow?.withoutExcludedPersonCount ?? 0;
    helpTextObs.value = caseRow?.minPriorObservation ?? 365;

    binaryRows.value = (binary ?? []).filter(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    continuousRows.value = (continuous ?? []).filter(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );

    binaryAbsSmdMin.value = 0;
    continuousAbsSmdMin.value = 0;
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
      ctxItems: [
        outcomeName.value,
        selectedDatabaseName.value,
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

  if (url?.tar && tarOptions.value.includes(url.tar)) {
    selectedTar.value = url.tar;
  }

  if (url?.washout && washoutOptions.value.includes(url.washout)) {
    selectedWashout.value = url.washout;
  }

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
@import "./shared/styles.css";

.risk-factors {
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
  color: v-bind(smdValColor);
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
  flex: 1 1 500px;
}
</style>
