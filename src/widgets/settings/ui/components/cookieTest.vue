<template>
  <Button @click="createCookie">Create cookie</Button>
  <Button @click="removeCookie">Remove cookie</Button>
  <Button @click="showCookie">Show cookie</Button>
  <Button @click="showExp">Show exp date</Button>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import CookiesService from "@/shared/api/cookiesService";
import { useStore } from "vuex";
const store = useStore();
const createCookie = () => {
  CookiesService.set(
    "bearerToken",
    "ijwoieqjweoiqjoifsdjfoijoiwqjeqwoeoi",
    new Date(Date.now() + 1000 * 60 * 60 * 24)
  );
};
const removeCookie = () => {
  CookiesService.remove("bearerToken");
};
const showCookie = () => {
  console.log(CookiesService.get("bearerToken"));
};
const showExp = () => {
  store.dispatch("test").then((val) => console.log(val));
};
</script>

<style scoped></style>
