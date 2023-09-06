<template>
    <v-btn v-if="store.getters.getQueryIndex" icon density="comfortable" target="_blank" :link-details="true"
        :href="sqlQueryLink">
        <v-icon>mdi-database-search</v-icon>
        <v-tooltip activator="parent" location="top">View Export Query</v-tooltip>
    </v-btn>
</template>
    
<script setup lang="ts">
import { defineProps, computed } from "vue";
import { links } from "@/shared/config/links";
import { onMounted } from "vue";
import { useStore } from "vuex";

interface Props {
    queryIndex?: string;
}

const store = useStore();
const props = defineProps<Props>();

const sqlQueryLink = computed(() => {
    return links.getSqlQueryLink(props.queryIndex);
});
</script>
    
<style scoped></style>

