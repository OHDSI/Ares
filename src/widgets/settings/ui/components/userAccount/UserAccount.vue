<template>
  <InputGroup v-if="!user && webApiDisabled">
    <InputText v-model="name" placeholder="Enter your name" />
    <InputGroupAddon>
      <Button text @click="save" icon="pi pi-times" severity="info">
        <svg-icon type="mdi" :path="mdiContentSaveOutline"></svg-icon>
      </Button>
    </InputGroupAddon>
  </InputGroup>

  <!--  <InputGroup v-if="!user && !webApiDisabled">-->
  <!--    <InputGroupAddon>-->
  <!--      <Button text @click="save" icon="pi pi-times" severity="info">-->
  <!--        Log in-->
  <!--        <svg-icon type="mdi" :path="mdiContentSaveOutline"></svg-icon>-->
  <!--      </Button>-->
  <!--    </InputGroupAddon>-->
  <!--  </InputGroup>-->

  <Button
    v-if="!user"
    @click="logIn"
    style="width: 100%; height: 30px"
    severity="secondary"
    >Log in to WebAPI</Button
  >

  <div v-else class="flex flex-col gap-2">
    <!--    <h3 class="text-2xl">Hello, {{ user.name }}</h3>-->
    <div class="flex flex-row items-center gap-2">
      <SvgIcon type="mdi" :path="mdiAccountCircle" size="60" />
      <div>
        <div class="text-2xl">{{ user.name }}</div>
        <div class="font-thin">Expires: {{ user.exp }}</div>
      </div>
    </div>
    <Button
      v-if="user && !webApiDisabled"
      @click="logout"
      severity="secondary"
      class="align-self-end"
      >Log out</Button
    >
    <!--    <Button-->
    <!--      v-if="!store.getters.getWebAPIUser"-->
    <!--      text-->
    <!--      @click="user = null"-->
    <!--      class="align-self-end"-->
    <!--      plain-->
    <!--    >-->
    <!--      <svg-icon type="mdi" :path="mdiAccountEditOutline"></svg-icon>-->
    <!--    </Button>-->
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
  GET_USER,
  LOG_OUT,
} from "@/shared/api/webAPI/authentication/model/store/actions.type";

const webApiDisabled = environment.WEB_API_ENABLED === "false";

const store = useStore();

const logIn = function () {
  store.dispatch(WEB_API_LOG_IN);
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
