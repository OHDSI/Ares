<script setup lang="ts"></script>

<template>
  <div class="help">Help and information</div>
  <div class="Options">
    <Dropdown>Target</Dropdown>
    <Dropdown>Outcome</Dropdown>
  </div>

  <div class="selected">
    <div>
      <p>Target1</p>
      <p>Target2</p>
    </div>
    <div>
      <p>Outcome1</p>
      <p>Outcome2</p>
    </div>
  </div>

  <!--  <div class="table">-->
  <!--    <Dropdown>Columns to display</Dropdown>-->
  <!--    &lt;!&ndash;Global search&ndash;&gt;-->
  <!--    <DataTable-->
  <!--      :striped-rows="store.getters.getSettings.strippedRows"-->
  <!--      removable-sort-->
  <!--      size="small"-->
  <!--      paginator-->
  <!--      currentPageReportTemplate="{first} to {last} of {totalRecords}"-->
  <!--      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"-->
  <!--      :value="data"-->
  <!--      :rows="5"-->
  <!--      :rowsPerPageOptions="[5, 10, 20, 50]"-->
  <!--    >-->
  <!--      <Column-->
  <!--        sortable-->
  <!--        header="Actions (button: view models, view diagnostics)"-->
  <!--        field="cdm_source_name"-->
  <!--      >-->
  <!--      </Column>-->

  <!--      <Column sortable header="Design ID" field="cdm_source_name"> </Column>-->
  <!--      <Column sortable header="Model Type" field="cdm_source_abbreviation">-->
  <!--      </Column>-->
  <!--      <Column sortable header="Target Pop" field="cdm_holder"> </Column>-->

  <!--      <Column sortable header="Outcome" field="source_description"> </Column>-->
  <!--      <Column sortable header="TAR" field="?"> </Column>-->
  <!--      <Column-->
  <!--        sortable-->
  <!--        header="Min AUROC"-->
  <!--        field="source_documentation_reference"-->
  <!--      >-->
  <!--      </Column>-->
  <!--      <Column sortable header="Mean AUROC" field="cdm_etl_reference"> </Column>-->
  <!--      <Column sortable header="Max AUROC" field="source_release_date"> </Column>-->
  <!--      <Column sortable header="Num Diagnostic Dbs" field="cdm_release_date">-->
  <!--      </Column>-->
  <!--      <Column sortable header="Num Development Dbs" field="cdm_version">-->
  <!--      </Column>-->
  <!--      <Column sortable header="Num Validation Dbs" field="vocabulary_version">-->
  <!--      </Column>-->

  <!--      &lt;!&ndash;   Pagination   &ndash;&gt;-->
  <!--    </DataTable>-->
  <!--  </div>-->
</template>

<style scoped></style>
