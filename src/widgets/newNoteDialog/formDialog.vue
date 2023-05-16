<template>
  <div v-if="props.show" class="text-center">
    <v-dialog v-model="sh" width="auto">
      <v-card>
        <v-card-title class="bg-blue px-5 text-center">{{
          formTitle
        }}</v-card-title>
        <v-sheet width="300" class="mx-auto">
          <v-form class="px-5 pt-4" @submit="submit">
            <v-text-field
              :rules="[rules.required]"
              variant="outlined"
              v-model="title"
              label="Title"
            ></v-text-field>
            <v-textarea
              variant="outlined"
              v-model="description"
              label="Description"
              placeholder="optional"
              counter
            ></v-textarea>
          </v-form>
        </v-sheet>
        <v-card-actions class="justify-space-between">
          <v-btn block @click="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, watch } from "vue";
interface Props {
  action: (a, b) => void;
  data?: {
    title: string;
    description: string;
  };
  formTitle?: string;
  show: boolean;
}

const sh = computed({
  get: function () {
    return props.show;
  },
  set: function () {
    emit("close");
    title.value = "";
    description.value = "";
  },
});

const emit = defineEmits(["close"]);

const props = defineProps<Props>();

const title = ref("");
const description = ref("");

const computedData = computed(() => {
  return props.data;
});

const rules = {
  required: (value) => !!value || "Required field",
  characterLimit: (v) => v.length <= 125 || "Max 125 characters",
};

watch(computedData, () => {
  if (!computedData.value) {
    return;
  }
  title.value = props.data.title;
  description.value = props.data.description;
});

function submit() {
  props.action(title.value, description.value);
  emit("close");
  title.value = "";
  description.value = "";
}
</script>

<style scoped></style>
