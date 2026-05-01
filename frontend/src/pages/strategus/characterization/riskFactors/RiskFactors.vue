<template>
  <div class="risk-factors">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <div class="controls-row">
        <div>
          <label class="field-label">Database</label>
          <MultiSelect
            v-model="selectedDatabases"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            class="w-full"
            :maxSelectedLabels="1"
            selectedItemsLabel="{0} databases"
            display="chip"
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
        ...lastGeneratedConfig.selectedDatabaseNames,
        `TAR: ${lastGeneratedConfig.selectedTar}`,
        `Washout: ${lastGeneratedConfig.selectedWashout}d`,
      ]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <!-- Binary Features -->
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="helpTextObs">
              Fraction of patients ({{ helpTextObs }}d prior obs.) stratified by
              outcome during time-at-risk.
            </p>
            <div class="table-controls">
              <InputGroup unstyled class="table-search">
                <InputGroupAddon>
                  <i class="pi pi-search" />
                </InputGroupAddon>
                <InputText
                  v-model="search"
                  unstyled
                  placeholder="Search..."
                  class="rounded-r-lg"
                />
              </InputGroup>
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="selectedColumns"
                  :options="rfColumnOptions"
                  placeholder="Select columns"
                />
              </div>
              <div class="smd-threshold">
                <span class="smd-label">|SMD| ≥</span>
                <div class="smd-filter">
                  <Slider
                    v-model="binaryAbsSmdMin"
                    :min="0"
                    :max="smdMax"
                    :step="0.01"
                    class="smd-slider"
                  />
                  <span class="smd-val">{{ binaryAbsSmdMin.toFixed(2) }}</span>
                </div>
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
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :hidden="!selectedColumns.includes('covariateName')"
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
                          :filterObj="binaryTableFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('domain')"
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
                    :hidden="!selectedColumns.includes('concept')"
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
                          :filterObj="binaryTableFilters.concept"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('timeWindow')"
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
                    :hidden="!selectedColumns.includes('windowDays')"
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
                          :filterObj="binaryTableFilters.windowDays"
                          placeholder="e.g. -365 to -1"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedColumns.includes('subType')"
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
                    :hidden="!selectedColumns.includes('detail')"
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
                          :filterObj="binaryTableFilters.detail"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-for="ref in binaryRfRef"
                    :key="'bhdr-' + ref.id"
                    :header="`${ref.databaseName} (Cases: ${formatCensored(
                      ref.caseN
                    )} · Non-cases: ${formatCensored(ref.nonCaseN)})`"
                    :hidden="binaryDbGroupHidden"
                    :colspan="binaryDbColspan"
                    :pt="binaryHeaderPt(ref.id)"
                  />
                </Row>
                <Row>
                  <template v-for="ref in binaryRfRef" :key="'bsub-' + ref.id">
                    <Column
                      :hidden="!selectedColumns.includes('caseCount')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Case Count"
                      :sortField="'caseCount_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedColumns.includes('casePct')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Case %"
                      :sortField="'caseAverage_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedColumns.includes('nonCaseCount')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Non-case Count"
                      :sortField="'nonCaseCount_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedColumns.includes('nonCasePct')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Non-case %"
                      :sortField="'nonCaseAverage_' + ref.id"
                      sortable
                    />

                    <Column
                      :hidden="!selectedColumns.includes('SMD')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="SMD"
                      :sortField="'SMD_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedColumns.includes('absSMD')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="|SMD|"
                      :sortField="'absSMD_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row v-if="showBinaryFilters">
                  <template v-for="ref in binaryRfRef" :key="'bflt-' + ref.id">
                    <Column
                      :hidden="!selectedColumns.includes('caseCount')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryTableFilters['caseCount_' + ref.id]"
                          :filterObj="binaryTableFilters['caseCount_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedColumns.includes('casePct')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryTableFilters['caseAverage_' + ref.id]"
                          :filterObj="
                            binaryTableFilters['caseAverage_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedColumns.includes('nonCaseCount')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryTableFilters['nonCaseCount_' + ref.id]"
                          :filterObj="
                            binaryTableFilters['nonCaseCount_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedColumns.includes('nonCasePct')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryTableFilters['nonCaseAverage_' + ref.id]"
                          :filterObj="
                            binaryTableFilters['nonCaseAverage_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedColumns.includes('SMD')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryTableFilters['SMD_' + ref.id]"
                          :filterObj="binaryTableFilters['SMD_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column
                      :hidden="!selectedColumns.includes('absSMD')"
                      :pt="{
                        ...binarySubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                    >
                      <template #header>
                        <FilterInput
                          v-if="binaryTableFilters['absSMD_' + ref.id]"
                          :filterObj="binaryTableFilters['absSMD_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
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
              <template v-for="ref in binaryRfRef" :key="'bcol-' + ref.id">
                <Column
                  :hidden="!selectedColumns.includes('caseCount')"
                  style="text-align: end"
                  :field="'caseCount_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="binaryBodyPt(ref.id)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCensored(data['caseCount_' + ref.id])"
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
                  :hidden="!selectedColumns.includes('casePct')"
                  style="text-align: end"
                  :field="'caseAverage_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="binaryBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatPct(data["caseAverage_" + ref.id])
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
                  :field="'nonCaseCount_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="binaryBodyPt(ref.id)"
                >
                  <template #body="{ data }">
                    <CensoredCell
                      :text="formatCensored(data['nonCaseCount_' + ref.id])"
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
                  :hidden="!selectedColumns.includes('nonCasePct')"
                  style="text-align: end"
                  :field="'nonCaseAverage_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="binaryBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatPct(data["nonCaseAverage_" + ref.id])
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
                  :field="'SMD_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="binaryBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNum(data["SMD_" + ref.id])
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
                  :hidden="!selectedColumns.includes('absSMD')"
                  style="text-align: end"
                  :field="'absSMD_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="binaryBodyPt(ref.id)"
                >
                  <template #body="{ data }">{{
                    formatNum(data["absSMD_" + ref.id])
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

          <!-- Continuous Features -->
          <div v-else-if="activeResultTab === 1">
            <p class="table-note" v-if="helpTextObs">
              Continuous feature distributions ({{ helpTextObs }}d prior obs.)
              stratified by outcome during time-at-risk.
            </p>
            <div class="table-controls">
              <InputGroup unstyled class="table-search">
                <InputGroupAddon>
                  <i class="pi pi-search" />
                </InputGroupAddon>
                <InputText
                  v-model="search"
                  unstyled
                  placeholder="Search..."
                  class="rounded-r-lg"
                />
              </InputGroup>
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="selectedContinuousColumns"
                  :options="rfContinuousColumnOptions"
                  placeholder="Select columns"
                />
              </div>
              <div class="smd-threshold">
                <span class="smd-label">|SMD| ≥</span>
                <div class="smd-filter">
                  <Slider
                    v-model="continuousAbsSmdMin"
                    :min="0"
                    :max="smdMax"
                    :step="0.01"
                    class="smd-slider"
                  />
                  <span class="smd-val">{{
                    continuousAbsSmdMin.toFixed(2)
                  }}</span>
                </div>
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
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :hidden="
                      !selectedContinuousColumns.includes('covariateName')
                    "
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 4 : 3"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousTableFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('domain')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 4 : 3"
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
                    :rowspan="showContinuousFilters ? 4 : 3"
                    sortField="concept"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Concept</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousTableFilters.concept"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('timeWindow')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 4 : 3"
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
                    :rowspan="showContinuousFilters ? 4 : 3"
                    sortField="windowDays"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Window Days</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousTableFilters.windowDays"
                          placeholder="e.g. -365 to -1"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :hidden="!selectedContinuousColumns.includes('subType')"
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="showContinuousFilters ? 4 : 3"
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
                    :rowspan="showContinuousFilters ? 4 : 3"
                    sortField="detail"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Detail</span>
                        <FilterInput
                          v-if="showContinuousFilters"
                          :filterObj="continuousTableFilters.detail"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-for="ref in continuousRfRef"
                    :key="'chdr-' + ref.id"
                    :header="`${ref.databaseName} (Cases: ${formatCensored(
                      ref.caseN
                    )} · Target: ${formatCensored(ref.targetN)})`"
                    :hidden="contDbGroupHidden"
                    :colspan="contDbColspan"
                    :pt="contHeaderPt(ref.id)"
                  />
                </Row>
                <Row>
                  <template
                    v-for="ref in continuousRfRef"
                    :key="'csub2-' + ref.id"
                  >
                    <Column
                      header="Case"
                      :hidden="contCaseGroupHidden"
                      :colspan="contCaseGroupColspan"
                      :pt="contHeaderPt(ref.id)"
                    />
                    <Column
                      header="Target"
                      :hidden="contTargetGroupHidden"
                      :colspan="contTargetGroupColspan"
                      :pt="contHeaderPt(ref.id)"
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('SMD')"
                      header="SMD"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      :rowspan="showContinuousFilters ? 3 : 2"
                      :sortField="'SMD_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('absSMD')"
                      header="|SMD|"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      :rowspan="showContinuousFilters ? 3 : 2"
                      :sortField="'absSMD_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row>
                  <template
                    v-for="ref in continuousRfRef"
                    :key="'csub3-' + ref.id"
                  >
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseCount')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Count"
                      :sortField="'caseCountValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseMean')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Mean"
                      :sortField="'caseAverageValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseStdev')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="StDev"
                      :sortField="'caseStandardDeviation_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('caseMedian')
                      "
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Median"
                      :sortField="'caseMedianValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseMin')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Min"
                      :sortField="'caseMinValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseMax')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Max"
                      :sortField="'caseMaxValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetCount')
                      "
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Count"
                      :sortField="'targetCountValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetMean')
                      "
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Mean"
                      :sortField="'targetAverageValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetStdev')
                      "
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="StDev"
                      :sortField="'targetStandardDeviation_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetMedian')
                      "
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Median"
                      :sortField="'targetMedianValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('targetMin')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Min"
                      :sortField="'targetMinValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :hidden="!selectedContinuousColumns.includes('targetMax')"
                      :pt="{
                        ...contSubPt(ref.id),
                        headerContent: 'justify-end',
                      }"
                      header="Max"
                      :sortField="'targetMaxValue_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row v-if="showContinuousFilters">
                  <template
                    v-for="ref in continuousRfRef"
                    :key="'cflt-' + ref.id"
                  >
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseCount')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['caseCountValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['caseCountValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseMean')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['caseAverageValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['caseAverageValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseStdev')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters[
                              'caseStandardDeviation_' + ref.id
                            ]
                          "
                          :filterObj="
                            continuousTableFilters[
                              'caseStandardDeviation_' + ref.id
                            ]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('caseMedian')
                      "
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['caseMedianValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['caseMedianValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseMin')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['caseMinValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['caseMinValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('caseMax')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['caseMaxValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['caseMaxValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetCount')
                      "
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['targetCountValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['targetCountValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetMean')
                      "
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters[
                              'targetAverageValue_' + ref.id
                            ]
                          "
                          :filterObj="
                            continuousTableFilters[
                              'targetAverageValue_' + ref.id
                            ]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetStdev')
                      "
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters[
                              'targetStandardDeviation_' + ref.id
                            ]
                          "
                          :filterObj="
                            continuousTableFilters[
                              'targetStandardDeviation_' + ref.id
                            ]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="
                        !selectedContinuousColumns.includes('targetMedian')
                      "
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters[
                              'targetMedianValue_' + ref.id
                            ]
                          "
                          :filterObj="
                            continuousTableFilters[
                              'targetMedianValue_' + ref.id
                            ]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('targetMin')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['targetMinValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['targetMinValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                    <Column
                      :hidden="!selectedContinuousColumns.includes('targetMax')"
                      :pt="contSubPt(ref.id)"
                    >
                      <template #header
                        ><FilterInput
                          v-if="
                            continuousTableFilters['targetMaxValue_' + ref.id]
                          "
                          :filterObj="
                            continuousTableFilters['targetMaxValue_' + ref.id]
                          "
                          input-style="width:100%"
                      /></template>
                    </Column>
                  </template>
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
              <template v-for="ref in continuousRfRef" :key="'ccol-' + ref.id">
                <Column
                  :hidden="!selectedContinuousColumns.includes('caseCount')"
                  style="text-align: end"
                  :field="'caseCountValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('caseMean')"
                  style="text-align: end"
                  :field="'caseAverageValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('caseStdev')"
                  style="text-align: end"
                  :field="'caseStandardDeviation_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('caseMedian')"
                  style="text-align: end"
                  :field="'caseMedianValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('caseMin')"
                  style="text-align: end"
                  :field="'caseMinValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('caseMax')"
                  style="text-align: end"
                  :field="'caseMaxValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('targetCount')"
                  style="text-align: end"
                  :field="'targetCountValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
                >
                  <template #body="{ data }"
                    ><CensoredCell
                      :text="
                        formatCensored(data['targetCountValue_' + ref.id])
                      "
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
                  :hidden="!selectedContinuousColumns.includes('targetMean')"
                  style="text-align: end"
                  :field="'targetAverageValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('targetStdev')"
                  style="text-align: end"
                  :field="'targetStandardDeviation_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('targetMedian')"
                  style="text-align: end"
                  :field="'targetMedianValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('targetMin')"
                  style="text-align: end"
                  :field="'targetMinValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('targetMax')"
                  style="text-align: end"
                  :field="'targetMaxValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('SMD')"
                  style="text-align: end"
                  :field="'SMD_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
                  :hidden="!selectedContinuousColumns.includes('absSMD')"
                  style="text-align: end"
                  :field="'absSMD_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                  :pt="contBodyPt(ref.id)"
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
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, one or more databases, TAR, and washout, then click
      Generate.
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
import MultiSelect from "primevue/multiselect";
import Slider from "primevue/slider";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import FilterInput from "../shared/filterInput";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();
const { headerPt, subPt, bodyPt } = useGroupBanding();

const STORAGE_KEY_BINARY = "char:riskFactors:binary";
const STORAGE_KEY_CONT = "char:riskFactors:continuous";

const rfColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "Case Count", key: "caseCount" },
  { label: "Case %", key: "casePct" },
  { label: "Non-case Count", key: "nonCaseCount" },
  { label: "Non-case %", key: "nonCasePct" },
  { label: "SMD", key: "SMD" },
  { label: "|SMD|", key: "absSMD" },
];
const RF_DEFAULT_BINARY = [
  "covariateName",
  "caseCount",
  "casePct",
  "nonCaseCount",
  "nonCasePct",
  "absSMD",
];
const selectedColumns = ref<string[]>(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_BINARY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_BINARY]
    : RF_DEFAULT_BINARY
);
watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_BINARY]: val });
});

const rfContinuousColumnOptions = [
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
const RF_DEFAULT_CONT = [
  "covariateName",
  "caseMean",
  "caseStdev",
  "caseMedian",
  "targetMean",
  "targetStdev",
  "targetMedian",
  "absSMD",
];
const selectedContinuousColumns = ref<string[]>(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY_CONT]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY_CONT]
    : RF_DEFAULT_CONT
);
watch(selectedContinuousColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY_CONT]: val });
});

// Binary group banding helpers
const binaryRfRef = ref<
  { id: string; databaseName: string; caseN: number; nonCaseN: number }[]
>([]);
const binaryDbIndexMap = computed(() => {
  const map: Record<string, number> = {};
  binaryRfRef.value.forEach((ref, i) => {
    map[ref.id] = i;
  });
  return map;
});
const binaryHeaderPt = (id: string) =>
  headerPt(binaryDbIndexMap.value[id] ?? 0);
const binarySubPt = (id: string) => subPt(binaryDbIndexMap.value[id] ?? 0);
const binaryBodyPt = (id: string) => bodyPt(binaryDbIndexMap.value[id] ?? 0);

const binaryDbColsCounted = computed(
  () =>
    [
      "caseCount",
      "casePct",
      "nonCaseCount",
      "nonCasePct",
      "SMD",
      "absSMD",
    ].filter((k) => selectedColumns.value.includes(k)).length
);
const binaryDbColspan = computed(() => binaryDbColsCounted.value || 1);
const binaryDbGroupHidden = computed(() => binaryDbColsCounted.value === 0);

// Continuous group banding helpers
const continuousRfRef = ref<
  { id: string; databaseName: string; caseN: number; targetN: number }[]
>([]);
const contDbIndexMap = computed(() => {
  const map: Record<string, number> = {};
  continuousRfRef.value.forEach((ref, i) => {
    map[ref.id] = i;
  });
  return map;
});
const contHeaderPt = (id: string) => headerPt(contDbIndexMap.value[id] ?? 0);
const contSubPt = (id: string) => subPt(contDbIndexMap.value[id] ?? 0);
const contBodyPt = (id: string) => bodyPt(contDbIndexMap.value[id] ?? 0);

const contCaseKeys = [
  "caseCount",
  "caseMean",
  "caseStdev",
  "caseMedian",
  "caseMin",
  "caseMax",
];
const contTargetKeys = [
  "targetCount",
  "targetMean",
  "targetStdev",
  "targetMedian",
  "targetMin",
  "targetMax",
];
const contCaseGroupColspan = computed(
  () =>
    contCaseKeys.filter((k) => selectedContinuousColumns.value.includes(k))
      .length || 1
);
const contCaseGroupHidden = computed(
  () => !contCaseKeys.some((k) => selectedContinuousColumns.value.includes(k))
);
const contTargetGroupColspan = computed(
  () =>
    contTargetKeys.filter((k) => selectedContinuousColumns.value.includes(k))
      .length || 1
);
const contTargetGroupHidden = computed(
  () => !contTargetKeys.some((k) => selectedContinuousColumns.value.includes(k))
);
const contDbColspan = computed(() => {
  const c = contCaseKeys.filter((k) =>
    selectedContinuousColumns.value.includes(k)
  ).length;
  const t = contTargetKeys.filter((k) =>
    selectedContinuousColumns.value.includes(k)
  ).length;
  const s =
    (selectedContinuousColumns.value.includes("SMD") ? 1 : 0) +
    (selectedContinuousColumns.value.includes("absSMD") ? 1 : 0);
  return c + t + s || 1;
});
const contDbGroupHidden = computed(() => contDbColspan.value === 0);

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
const selectedDatabases = ref<string[]>([]);
const selectedTar = ref(null);
const selectedWashout = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const helpTextObs = ref(null);

const binaryAbsSmdMin = ref(0);
const continuousAbsSmdMin = ref(0);
const smdMax = ref(2);

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

const binaryTableFilters = ref<Record<string, any>>({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousTableFilters = ref<Record<string, any>>({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
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

watch(binaryRfRef, (newRefs) => {
  const f: Record<string, any> = {
    covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
    windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
    detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  for (const ref of newRefs) {
    for (const key of [
      "caseCount",
      "caseAverage",
      "nonCaseCount",
      "nonCaseAverage",
      "SMD",
      "absSMD",
    ]) {
      f[`${key}_${ref.id}`] = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      };
    }
  }
  binaryTableFilters.value = f;
  binaryDropdownFilters.value = {
    domain: null,
    subType: null,
    timeWindow: null,
  };
});

watch(continuousRfRef, (newRefs) => {
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
  continuousTableFilters.value = f;
  continuousDropdownFilters.value = {
    domain: null,
    subType: null,
    timeWindow: null,
  };
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseNames = computed(() =>
  availableDatabases.value
    .filter((d) => selectedDatabases.value.includes(d.id))
    .map((d) => d.name)
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
  if (binaryAbsSmdMin.value > 0) {
    rows = rows.filter((r) =>
      binaryRfRef.value.some(
        (ref) => (r[`absSMD_${ref.id}`] ?? 0) >= binaryAbsSmdMin.value
      )
    );
  }
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
  if (continuousAbsSmdMin.value > 0) {
    rows = rows.filter((r) =>
      continuousRfRef.value.some(
        (ref) => (r[`absSMD_${ref.id}`] ?? 0) >= continuousAbsSmdMin.value
      )
    );
  }
  return rows;
});

watch(selectedOutcome, () => {
  showResults.value = false;
  selectedTar.value = tarOptions.value.length ? tarOptions.value[0] : null;
  selectedWashout.value = washoutOptions.value.length
    ? washoutOptions.value[0]
    : null;
});

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
  }
);

function pivotBinary(rows: any[]) {
  if (!rows.length) return { rfRef: [], pivoted: [] };

  const dbMap = new Map<string, any>();
  for (const r of rows) {
    if (!dbMap.has(r.databaseId)) {
      dbMap.set(r.databaseId, {
        id: r.databaseId,
        databaseName: r.databaseName,
        caseN: r.casePersonCount,
        nonCaseN: r.nonCasePersonCount,
      });
    }
  }
  const rfRef = [...dbMap.values()];

  const covMap = new Map<number, any>();
  for (const r of rows) {
    if (!covMap.has(r.covariateId)) {
      covMap.set(r.covariateId, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
      });
    }
    const row = covMap.get(r.covariateId);
    const id = r.databaseId;
    row[`caseCount_${id}`] = r.caseCount;
    row[`caseAverage_${id}`] = r.caseAverage;
    row[`nonCaseCount_${id}`] = r.nonCaseCount;
    row[`nonCaseAverage_${id}`] = r.nonCaseAverage;
    row[`SMD_${id}`] = r.SMD;
    row[`absSMD_${id}`] = r.absSMD;
  }

  return { rfRef, pivoted: [...covMap.values()] };
}

function pivotContinuous(rows: any[]) {
  if (!rows.length) return { rfRef: [], pivoted: [] };

  const dbMap = new Map<string, any>();
  for (const r of rows) {
    if (!dbMap.has(r.databaseId)) {
      dbMap.set(r.databaseId, {
        id: r.databaseId,
        databaseName: r.databaseName,
        caseN: r.casePersonCount,
        targetN: r.targetPersonCount,
      });
    }
  }
  const rfRef = [...dbMap.values()];

  const covMap = new Map<number, any>();
  for (const r of rows) {
    if (!covMap.has(r.covariateId)) {
      covMap.set(r.covariateId, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
      });
    }
    const row = covMap.get(r.covariateId);
    const id = r.databaseId;
    row[`caseCountValue_${id}`] = r.caseCountValue;
    row[`caseAverageValue_${id}`] = r.caseAverageValue;
    row[`caseStandardDeviation_${id}`] = r.caseStandardDeviation;
    row[`caseMedianValue_${id}`] = r.caseMedianValue;
    row[`caseMinValue_${id}`] = r.caseMinValue;
    row[`caseMaxValue_${id}`] = r.caseMaxValue;
    row[`targetCountValue_${id}`] = r.targetCountValue;
    row[`targetAverageValue_${id}`] = r.targetAverageValue;
    row[`targetStandardDeviation_${id}`] = r.targetStandardDeviation;
    row[`targetMedianValue_${id}`] = r.targetMedianValue;
    row[`targetMinValue_${id}`] = r.targetMinValue;
    row[`targetMaxValue_${id}`] = r.targetMaxValue;
    row[`SMD_${id}`] = r.SMD;
    row[`absSMD_${id}`] = r.absSMD;
  }

  return { rfRef, pivoted: [...covMap.values()] };
}

async function fetchCaseCounts(targetId, outcomeId, databaseIds, tar) {
  const res = await StrategusService.characterization.getCaseCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseIds?.length ? databaseIds : undefined,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

async function fetchCaseTargetCounts(targetId, outcomeId, databaseIds) {
  const res = await StrategusService.characterization.getCaseTargetCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseIds?.length ? databaseIds : undefined,
  });
  return res.data;
}

async function fetchBinaryRiskFactors(targetId, outcomeId, databaseIds, tar) {
  const res = await StrategusService.characterization.getBinaryRiskFactors({
    targetId,
    outcomeId,
    databaseIds: databaseIds?.length ? databaseIds : undefined,
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
  databaseIds,
  tar
) {
  const res = await StrategusService.characterization.getContinuousRiskFactors({
    targetId,
    outcomeId,
    databaseIds: databaseIds?.length ? databaseIds : undefined,
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
    !selectedDatabases.value.length ||
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
    const databaseIds = selectedDatabases.value;
    const tarIdx = tarOptions.value.indexOf(selectedTar.value);
    const tar = tarValues.value[tarIdx];

    if (!tar || !tar.startAnchor) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    const [caseCounts, targetCounts, binary, continuous] = await Promise.all([
      fetchCaseCounts(targetId, outcomeId, databaseIds, tar),
      fetchCaseTargetCounts(targetId, outcomeId, databaseIds),
      fetchBinaryRiskFactors(targetId, outcomeId, databaseIds, tar),
      fetchContinuousRiskFactors(targetId, outcomeId, databaseIds, tar),
    ]);

    const washout = selectedWashout.value;
    const firstCaseRow = caseCounts.find(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    helpTextObs.value = firstCaseRow?.minPriorObservation ?? 365;

    const caseCountByDb = new Map<string, number>();
    for (const r of caseCounts) {
      if (String(r.outcomeWashoutDays) === String(washout)) {
        caseCountByDb.set(r.databaseId, r.personCount ?? 0);
      }
    }
    const targetCountByDb = new Map<string, number>();
    for (const r of targetCounts) {
      if (String(r.outcomeWashoutDays) === String(washout)) {
        targetCountByDb.set(
          r.databaseId,
          r.withoutExcludedPersonCount ?? r.personCount ?? 0
        );
      }
    }

    const filteredBinary = (binary ?? []).filter(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    const filteredContinuous = (continuous ?? [])
      .filter((r) => String(r.outcomeWashoutDays) === String(washout))
      .map((r) => ({
        ...r,
        casePersonCount: caseCountByDb.get(r.databaseId) ?? 0,
        targetPersonCount: targetCountByDb.get(r.databaseId) ?? 0,
      }));

    const binPivot = pivotBinary(filteredBinary);
    const contPivot = pivotContinuous(filteredContinuous);

    binaryRfRef.value = binPivot.rfRef;
    binaryRows.value = binPivot.pivoted;
    continuousRfRef.value = contPivot.rfRef;
    continuousRows.value = contPivot.pivoted;

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
      selectedDatabaseNames: selectedDatabaseNames.value,
      selectedDatabaseIds: [...databaseIds],
      selectedOutcome: selectedOutcome?.value?.cohortId,
      selectedTar: selectedTar.value,
      selectedWashout: selectedWashout.value,
    };
    emit("state-change", {
      outcomeId: selectedOutcome.value.cohortId,
      databaseIds,
      tar: selectedTar.value,
      washout: selectedWashout.value,
      databases: selectedDatabaseNames.value,
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
    !selectedDatabases.value.length ||
    !selectedOutcome.value ||
    !selectedWashout.value
  )
    return true;
  if (!lastGeneratedConfig.value) return false;
  const sameIds =
    selectedDatabases.value.length ===
      lastGeneratedConfig.value.selectedDatabaseIds?.length &&
    selectedDatabases.value.every((id) =>
      lastGeneratedConfig.value.selectedDatabaseIds.includes(id)
    );
  return (
    sameIds &&
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

  if (url?.databaseIds?.length) {
    const valid = url.databaseIds.filter((id) =>
      availableDatabases.value.some((d) => d.id === id)
    );
    if (valid.length) selectedDatabases.value = valid;
  } else if (
    url?.databaseId &&
    availableDatabases.value.some((d) => d.id === url.databaseId)
  ) {
    selectedDatabases.value = [url.databaseId];
  }

  await nextTick();

  if (url?.tar && tarOptions.value.includes(url.tar))
    selectedTar.value = url.tar;
  if (url?.washout && washoutOptions.value.includes(url.washout))
    selectedWashout.value = url.washout;

  await nextTick();
  if (
    selectedOutcome.value &&
    selectedDatabases.value.length &&
    selectedTar.value &&
    selectedWashout.value
  ) {
    await generate();
  }
});
</script>

<style scoped>
@import "../shared/styles.css";

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

.smd-threshold {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-end;
  padding-bottom: 2px;
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
