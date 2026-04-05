<template>
  <InputText
    v-model="localValue"
    :placeholder="placeholder"
    size="small"
    :style="inputStyle"
    @keydown.stop
    @click.stop
  />
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import InputText from "primevue/inputtext";

const props = defineProps({
  filterObj: { type: Object, default: null },
  placeholder: { type: String, default: "Filter..." },
  inputStyle: { type: String, default: undefined },
});

const localValue = ref(props.filterObj?.value || "");

watch(
  () => props.filterObj?.value,
  (v) => {
    if (!v) localValue.value = "";
  }
);

let debounceTimer = null;
onUnmounted(() => clearTimeout(debounceTimer));

watch(localValue, (v) => {
  if (!props.filterObj) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    props.filterObj.value = v || null;
  }, 600);
});
</script>
