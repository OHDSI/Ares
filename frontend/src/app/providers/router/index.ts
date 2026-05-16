import { createRouter, createWebHashHistory, Router } from "vue-router";
import { routes } from "@/processes/exploreReports";
import store from "@/app/providers/store";
import { RESET_DATA_STORAGE } from "@/processes/exploreReports/model/store/actions.type";

const router: Router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  const trackKey = (r) =>
    JSON.stringify({
      name: r.name,
      cdm: r.params.cdm,
      release: r.params.release,
      domain: r.params.domain,
    });
  if (trackKey(to) !== trackKey(from)) {
    store.dispatch(RESET_DATA_STORAGE);
  }
});

export default router;
