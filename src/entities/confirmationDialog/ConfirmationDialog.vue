<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="auto">
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props"> Open Dialog </v-btn>
      </template>

      <v-card>
        <v-card-text>
          Are you sure you want to delete the {{ props.action.title }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialog = false">Confirm</v-btn>
          <v-btn color="error" @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";

interface Props {
  save: () => void;
  cancel: () => void;
  action: { title: string };
}

const dialog = ref(false);

const props = defineProps<Props>();
</script>

<style scoped></style>
