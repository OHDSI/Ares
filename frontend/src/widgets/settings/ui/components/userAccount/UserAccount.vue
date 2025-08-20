<template>
  <InputGroup v-if="!user && webApiDisabled">
    <InputText v-model="name" placeholder="Enter your name" />
    <InputGroupAddon>
      <Button text @click="save" icon="pi pi-times" severity="info">
        <svg-icon type="mdi" :path="mdiContentSaveOutline"></svg-icon>
      </Button>
    </InputGroupAddon>
  </InputGroup>
  <div v-if="!user && !webApiDisabled && !loading">
    <Button
      @click="logIn"
      style="width: 100%; height: 30px"
      severity="secondary"
      >Log in to WebAPI</Button
    >
  </div>

  <div v-if="user" class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
      <SvgIcon type="mdi" :path="mdiAccountCircle" size="60" />
      <div>
        <div class="text-2xl">{{ user?.name }}</div>
        <div v-if="!webApiDisabled" class="font-light">
          Expires: {{ user?.exp }}
        </div>
      </div>
    </div>
    <Button
      v-if="user"
      @click="logout"
      severity="secondary"
      class="align-self-end"
      >Log out</Button
    >
  </div>
  <div class="flex flex-row justify-center items-center gap-2" v-if="loading">
    <div
      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
      role="status"
    ></div>
    <span>Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { EDIT_USER } from "@/widgets/settings/model/store/actions.type";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import {
  mdiAccountEditOutline,
  mdiContentSaveOutline,
  mdiAccountCircle,
} from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
import environment from "@/shared/api/environment";
import {
  WEB_API_LOG_IN,
  LOG_OUT,
} from "@/shared/api/webAPI/authentication/model/store/actions.type";

const webApiDisabled = !environment.WEB_API_ENABLED;

const store = useStore();

const loggedIn = ref(null);
const loading = ref(false);

const logIn = async function () {
  loading.value = true;
  try {
    loggedIn.value = await store.dispatch(WEB_API_LOG_IN);
  } catch (error) {
    console.error("Login failed:", error);
  } finally {
    loading.value = false;
  }
};

const logout = function () {
  store.dispatch(LOG_OUT);
};

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
