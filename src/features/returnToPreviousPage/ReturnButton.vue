<template>
  <Button
    style="width: 130px; height: 30px"
    :size="props.block ? 'block' : 'small'"
    @click="back"
  >
    <svg-icon
      class="text-white text-lg"
      type="mdi"
      :path="mdiArrowLeft"
    ></svg-icon>
    <span class="uppercase text-white text-base">Back</span>
  </Button>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { mdiArrowLeft } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
const props = defineProps<Props>();

interface Props {
  block?: boolean;
}

const router = useRouter();
const back = function (): void {
  router.back();
};
</script>

<style scoped></style>
