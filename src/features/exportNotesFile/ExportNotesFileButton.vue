<template>
  <v-btn
    variant="flat"
    block
    :download="`notes-${dataUrl.date}.json`"
    :href="dataUrl.url"
    ><a download="notesData.json">Export Notes</a>
  </v-btn>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();

const dataUrl = computed(() => {
  const taBlob = new Blob([JSON.stringify(store.getters.getNotes)], {
    type: "application/json",
  });

  const date = new Date();

  const dateString = `${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}`;

  return { url: URL.createObjectURL(taBlob), date: dateString };
});
</script>

<style scoped></style>
