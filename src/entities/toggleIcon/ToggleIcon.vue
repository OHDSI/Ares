<template>
  <div>
    <Button
      v-tooltip.top="{
        value: props.tooltip,
        pt: {
          root: 'absolute',
          arrow: {
            style: {
              borderRightColor: 'var(--primary-color)',
            },
          },
          text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-light p-2 break-words text-wrap max-w-[20ch]',
        },
      }"
      @click="activate"
      text
      rounded
      size="icon"
      label="Search"
      plain
      :class="`${
        activated
          ? 'text-primary-500 dark:text-primary-400'
          : 'text-black dark:text-primary-50'
      }`"
    >
      <span
        v-if="!isUndefined(props.count)"
        :class="`${
          activated
            ? 'dark:bg-primary-50 dark:text-black bg-black text-white '
            : 'bg-primary-500 dark:bg-primary-400 text-white'
        } px-2 py-1 rounded-full z-10 top-0 right-0 absolute indent-0 text-xs`"
        :style="{ right: '-3px' }"
      >
        {{ props.count }}
      </span>
      <svg-icon type="mdi" :path="props.icon"></svg-icon>
    </Button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import SvgIcon from "@jamescoyle/vue-icon";
import { isUndefined } from "lodash";

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
