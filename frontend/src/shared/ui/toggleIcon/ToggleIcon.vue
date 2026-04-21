<template>
  <div class="overflow-visible">
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
            ? 'dark:bg-primary-50 dark:text-black bg-black text-white'
            : 'bg-surface-400 dark:bg-surface-500 text-white'
        } w-5 h-5 rounded-full z-10 absolute flex items-center justify-center text-[10px] leading-none ring-2 ring-white dark:ring-surface-900`"
        :style="{ top: '1px', right: '1px' }"
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
import SvgIcon from "@/shared/ui/SvgIcon.vue";
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
