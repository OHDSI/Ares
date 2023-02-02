import { createRouter, Router } from "vue-router";
import { routes } from "@/processes/exploreReports";
import { createWebHistory } from "vue-router";

const router: Router = createRouter({
  history: createWebHistory("ares"),
  routes,
});

export default router;
