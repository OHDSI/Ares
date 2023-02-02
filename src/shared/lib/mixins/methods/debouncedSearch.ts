import { debounce } from "lodash";
import { useRouter } from "vue-router";

const router = useRouter();

export const debouncedSearch = debounce(function (data: string) {
  router.push({
    query: {
      search: data,
    },
  });
}, 300);
