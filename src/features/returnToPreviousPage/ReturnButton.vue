<template>
  <v-btn
    :block="props.block"
    color="primary"
    density="comfortable"
    @click="back"
  >
    <v-icon>mdi-arrow-left</v-icon>
    Back
  </v-btn>
</template>

<script lang="ts">
export default {
  name: "ReturnButton",
};
</script>
<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<Props>();

interface Props {
  block?: boolean;
}

import { useRouter } from "vue-router";

const router = useRouter();
const back = function (): void {
  router.back();
};
</script>

<style scoped></style>
