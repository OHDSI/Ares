<template>
  <div>
    <table class="border-separate border-spacing-y-5 border-spacing-x-10">
      <tr>
        <td class="font-bold">CDM Source Name</td>
        <td>{{ store.getters.getData.cdmSourceName }}</td>
      </tr>
      <tr>
        <td class="font-bold">Description</td>
        <td>{{ store.getters.getData.sourceDescription }}</td>
      </tr>
      <tr>
        <td class="font-bold">Licensee</td>
        <td>{{ store.getters.getData.cdmHolder }}</td>
      </tr>
      <tr>
        <td class="font-bold">Source Released</td>
        <td>{{ store.getters.getData.sourceReleaseDate }}</td>
      </tr>
      <tr>
        <td class="font-bold">CDM Version</td>
        <td>{{ store.getters.getData.cdmVersion }}</td>
      </tr>
      <tr>
        <td class="font-bold">DQD Version</td>
        <td>{{ store.getters.getData.dqdVersion }}</td>
      </tr>
      <tr>
        <td class="font-bold">Vocabulary Version</td>
        <td>{{ store.getters.getData.vocabularyVersion }}</td>
      </tr>
      <tr>
        <td class="font-bold">Source Documentation</td>
        <td class="flex flex-row gap-2">
          <span>
            {{ store.getters.getData.sourceDocumentationReference }}
          </span>
          <a
            :href="store.getters.getData.sourceDocumentationReference"
            target="_blank"
          >
            <i>
              <svg-icon
                class="text-primary-500"
                type="mdi"
                :path="mdiOpenInNew"
              ></svg-icon
            ></i>
          </a>
        </td>
      </tr>
      <tr>
        <td class="font-bold">ETL Reference</td>
        <td class="flex flex-row gap-2">
          <span> {{ store.getters.getData.cdmEtlReference }} </span>
          <a :href="store.getters.getData.cdmEtlReference" target="_blank">
            <i>
              <svg-icon
                class="text-primary-500"
                type="mdi"
                :path="mdiOpenInNew"
              ></svg-icon
            ></i>
          </a>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { mdiOpenInNew } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";

const store = useStore();
</script>

<style scoped></style>
