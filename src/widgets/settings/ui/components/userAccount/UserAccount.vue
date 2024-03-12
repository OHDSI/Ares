<template>
  <InputGroup v-if="!user">
    <InputText v-model="name" placeholder="Enter your name" />
    <InputGroupAddon>
      <Button text @click="save" icon="pi pi-times" severity="info">
        <svg-icon type="mdi" :path="mdiContentSaveOutline"></svg-icon>
      </Button>
    </InputGroupAddon>
  </InputGroup>

  <div v-else class="flex flex-row justify-center gap-5">
    <h3 class="text-2xl">Hello, {{ user.name }}</h3>
    <Button text @click="user = null" class="align-self-end" plain>
      <svg-icon type="mdi" :path="mdiAccountEditOutline"></svg-icon>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EDIT_USER } from "@/widgets/settings/model/store/actions.type";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { mdiAccountEditOutline, mdiContentSaveOutline } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";

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
