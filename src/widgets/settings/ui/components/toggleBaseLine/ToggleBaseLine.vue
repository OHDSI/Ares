<template>
  <v-list-item
    :title="zeroBaseLine ? 'Zero Baseline' : 'Non-zero baseline'"
    subtitle="Determines whether the axis starts from the 0 or the lowest value in
        the set"
  >
    <template v-slot:prepend>
      <v-list-item-action>
        <v-switch class="mr-2" v-model="zeroBaseLine"></v-switch>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "ToggleBaseLine",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_BASELINE_SETTING } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const zeroBaseLine = computed({
  get: function (): boolean {
    return store.getters.getSettings.zeroBaseline;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_BASELINE_SETTING, value);
  },
});
</script>

<style scoped></style>
