<template>
  <v-file-input density="compact" variant="outlined" v-model="file">
  </v-file-input>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { ref, watch } from "vue";
import { IMPORT_NOTES_FROM_FILE } from "@/widgets/notesPanel/model/store/actions.type";

const store = useStore();

const reader = new FileReader();
reader.addEventListener("load", (e) => {
  const data = e.target.result;
  store.dispatch(IMPORT_NOTES_FROM_FILE, JSON.parse(data));
});

const file = ref(null);

watch(file, () => {
  if (file.value[0]) {
    reader.readAsText(file.value[0]);
  }
});
</script>

<style scoped></style>
