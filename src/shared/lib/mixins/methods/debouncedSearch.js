import { debounce } from "lodash";

export const debouncedSearch = debounce(function (data) {
  this.$router.push({
    query: {
      search: data,
    },
  });
}, 300);
