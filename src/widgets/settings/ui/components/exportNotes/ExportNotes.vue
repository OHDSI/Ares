<template>
  <Button size="block" severity="secondary" @click="exportFiles">
    Export Notes
  </Button>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Button from "primevue/button";

const store = useStore();

function exportFiles() {
  const zip = new JSZip();
  for (const source in store.getters.getNotes) {
    const sourceContainer = new Blob(
      [JSON.stringify(store.getters.getNotes[source])],
      {
        type: "application/json",
      }
    );
    zip.folder(source).file("notes.json", sourceContainer);
  }
  zip
    .generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    })
    .then(function (content) {
      // see FileSaver.js
      saveAs(content, "notes.zip");
    });
}
</script>

<style scoped></style>
