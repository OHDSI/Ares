import Vue from "vue";
import VueRouter from "vue-router";
import { routes } from "@/processes/exploreReports";
Vue.use(VueRouter);

export default new VueRouter({
  base: "/ares/",
  routes,
});
