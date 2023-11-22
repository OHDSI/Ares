<template>
  <div>
    <Message :closable="false" severity="error">
      <template #messageicon>
        <div class="p-2">
          <svg-icon size="45" type="mdi" :path="mdiCloudAlert"></svg-icon>
        </div>
      </template>
      <div class="flex flex-col gap-2">
        <h3 class="text-xl">An error has occurred</h3>
        <ul class="flex flex-col gap-1">
          <li v-for="(error, index) in store.getters.getErrors" :key="index">
            <span style="color: white">{{ error.message }}</span> --
            <span style="color: white">{ {{ error.details }} }</span>
          </li>
        </ul>
      </div>
    </Message>
  </div>
</template>

<script lang="ts">
export default {
  name: "ErrorAlert",
};
</script>

<script setup lang="ts">
import { useStore } from "vuex";
import Message from "primevue/message";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiCloudAlert } from "@mdi/js";

const store = useStore();
</script>
<style scoped></style>
