// Copyright (c) 2016 Evan You,  https://github.com/vuejs/vuex-router-sync
export default function sync(store, router, options) {
  const moduleName = (options || {}).moduleName || "route";

  store.registerModule(moduleName, {
    namespaced: true,
    state: cloneRoute(router.currentRoute),
    mutations: {
      ROUTE_CHANGED: function ROUTE_CHANGED(state, transition) {
        store.state[moduleName] = cloneRoute(transition.to, transition.from);
      },
    },
  });

  let isTimeTraveling = false;
  let currentPath;

  // sync router on store change
  const storeUnwatch = store.watch(
    function (state) {
      return state[moduleName];
    },
    function (route) {
      const fullPath = route.fullPath;
      if (fullPath === currentPath) {
        return;
      }
      if (currentPath != null) {
        isTimeTraveling = true;
        router.push(route);
      }
      currentPath = fullPath;
    },
    { sync: true }
  );

  // sync store on router navigation
  const afterEachUnHook = router.afterEach(function (to, from) {
    if (isTimeTraveling) {
      isTimeTraveling = false;
      return;
    }
    currentPath = to.fullPath;
    store.commit(moduleName + "/ROUTE_CHANGED", { to: to, from: from });
  });

  return function unsync() {
    // On unsync, remove router hook
    if (afterEachUnHook != null) {
      afterEachUnHook();
    }

    // On unsync, remove store watch
    if (storeUnwatch != null) {
      storeUnwatch();
    }

    // On unsync, unregister Module with store
    store.unregisterModule(moduleName);
  };
}

function cloneRoute(to, from) {
  const clone = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta,
    matched: to.matched,
  };
  if (from) {
    clone.from = cloneRoute(from);
  }
  return Object.freeze(clone);
}
