import { createRouter, createWebHashHistory, Router } from "vue-router";
import { routes } from "@/processes/exploreReports";

const router: Router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
