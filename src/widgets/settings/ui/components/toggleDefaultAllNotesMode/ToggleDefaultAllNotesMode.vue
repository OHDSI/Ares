<template>
  <v-list-item
    :title="allNotesMode ? 'On' : 'Off'"
    subtitle="Switch default all notes mode"
  >
    <template v-slot:prepend>
      <v-list-item-action>
        <v-switch class="mr-2" v-model="allNotesMode"></v-switch>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEFAULT_ALL_NOTES_MODE } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const allNotesMode = computed({
  get: function (): boolean {
    return store.getters.getSettings.allNotesMode;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_DEFAULT_ALL_NOTES_MODE, value);
  },
});
</script>

<style scoped></style>
