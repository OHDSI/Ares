<template>
  <v-btn icon density="comfortable" @click="activate">
    <v-badge
      v-if="props.count !== undefined"
      :content="props.count"
      :color="activated ? 'primary' : 'default'"
    >
      <v-icon :color="activated ? 'primary' : 'default'">{{
        props.icon
      }}</v-icon>
    </v-badge>
    <v-icon v-else color="primary">{{ props.icon }}</v-icon>

    <v-tooltip activator="parent" location="top">{{ props.tooltip }}</v-tooltip>
  </v-btn>
</template>
<script setup lang="ts">
import { defineProps, onMounted } from "vue";
import { defineEmits, ref } from "vue";
const emit = defineEmits(["iconClicked"]);

interface Props {
  icon: string;
  color?: string;
  count?: string | number;
  tooltip: string;
  showState?: boolean;
  defaultState?: boolean;
}

const props = defineProps<Props>();

const activated = ref(false);

onMounted(() => {
  if (props.defaultState) {
    activated.value = props.defaultState;
    emit("iconClicked", activated.value);
  }
});

function activate() {
  if (props.showState) activated.value = !activated.value;
  emit("iconClicked", activated.value);
}
</script>

<style scoped></style>
