<template>
  <div class="flex flex-col gap-2">
    <span class="field-label">Chart color scheme</span>
    <Dropdown
      v-model="selectedScheme"
      :options="options"
      option-label="label"
      option-value="key"
    >
      <template #value="{ value }">
        <div v-if="value" class="flex items-center gap-2">
          <ColorSwatches :palette="COLOR_SCHEMES[value].palette" />
          <span>{{ COLOR_SCHEMES[value].label }}</span>
        </div>
      </template>
      <template #option="{ option }">
        <div class="flex items-center gap-2">
          <ColorSwatches :palette="COLOR_SCHEMES[option.key].palette" />
          <span>{{ option.label }}</span>
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { computed } from "vue";
import { useStore } from "vuex";
import { SET_COLOR_SCHEME } from "@/widgets/settings/model/store/actions.type";
import { COLOR_SCHEMES, COLOR_SCHEME_KEYS } from "@/shared/lib/chartColors";

const store = useStore();

const options = COLOR_SCHEME_KEYS.map((key) => ({
  key,
  label: COLOR_SCHEMES[key].label,
}));

const selectedScheme = computed({
  get: () => store.getters.getSettings.colorScheme ?? "okabe-ito",
  set: (value: string) => store.dispatch(SET_COLOR_SCHEME, value),
});

const ColorSwatches = {
  props: { palette: Array },
  template: `
    <span class="swatches">
      <span
        v-for="(color, i) in palette.slice(0, 6)"
        :key="i"
        class="swatch"
        :style="{ background: color === '#000000' ? '#555' : color }"
      />
    </span>
  `,
};
</script>

<style scoped>
.field-label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text-label);
}

:deep(.swatches) {
  display: inline-flex;
  gap: 2px;
  align-items: center;
}

:deep(.swatch) {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
</style>
