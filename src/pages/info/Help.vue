<template>
  <div v-if="!store.getters.getErrors" id="help">
    <Markdown
      v-if="contentLoaded"
      html
      breaks
      :source="markdownContent"
    ></Markdown>
  </div>
</template>
<script lang="ts">
export default {
  name: "Help",
};
</script>
<script setup lang="ts">
import Markdown from "vue3-markdown-it";
import { FETCH_FILES } from "@/processes/exploreReports/model/store/actions.type";
import { HELP } from "@/shared/config/files";

import { onBeforeMount, ref, Ref } from "vue";
import { useStore } from "vuex";

const store = useStore();

const contentLoaded: Ref<boolean> = ref(false);
const markdownContent = ref(null);

onBeforeMount(() => {
  store
    .dispatch(FETCH_FILES, {
      files: [{ name: HELP, required: true }],
    })
    .then(() => {
      if (!store.getters.getErrors) {
        markdownContent.value = store.getters.getData[HELP];
        contentLoaded.value = true;
      }
    });
});
</script>

<style></style>
