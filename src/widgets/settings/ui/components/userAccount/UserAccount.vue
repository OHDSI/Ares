<template>
  <v-card
    v-if="!user"
    density="compact"
    class="user align-center pa-4"
    elevation="0"
  >
    <v-text-field
      hide-details
      density="compact"
      variant="outlined"
      placeholder="Enter your name"
      v-model="name"
    >
      <template v-slot:append-inner>
        <v-btn
          size="20"
          density="compact"
          variant="plain"
          :disabled="!name.length"
          @click="save"
        >
          <v-icon>mdi-content-save-check-outline</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-card>
  <v-card v-else>
    <v-layout class="justify-center">
      <v-card-title> Hello, {{ user.name }} </v-card-title>
      <v-btn @click="user = null" class="align-self-end" variant="plain" icon
        ><v-icon>mdi-account-edit-outline</v-icon></v-btn
      >
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EDIT_USER } from "@/widgets/settings/model/store/actions.type";

const store = useStore();

const save = function () {
  store.dispatch(EDIT_USER, { name: name.value, avatar: "" });
};

const user = computed({
  get: function () {
    return store.getters.getWebAPIUser || store.getters.getSettings.user;
  },
  set: function (data) {
    store.dispatch(EDIT_USER, data);
  },
});

const name = ref("");
</script>

<style lang="scss" scoped>
.user {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1%;
}
</style>
