// https://github.com/vuejs/vuex-router-sync

// The MIT License (MIT)

// Copyright (c) 2016-present Evan You
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
//     The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
