<template>
  <v-list-item
    :title="minMax ? 'MIN/MAX' : 'P10/P90'"
    subtitle="Applicable to some reports. Determines whether to use Min/Max or P10/P90
      values for chart rendering"
  >
    <template v-slot:prepend>
      <v-list-item-action>
        <v-switch class="mr-2" v-model="minMax"></v-switch>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "ToggleMinMax",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_MINMAX_SETTING } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const minMax = computed({
  get: function (): boolean {
    return store.getters.getSettings.minMax;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_MINMAX_SETTING, value);
  },
});
</script>

<style scoped></style>
