import { ref, type Ref } from "vue";
import { FilterMatchMode } from "primevue/api";

interface NameFilters {
  parentName: { value: string | null; matchMode: string };
  cohortName: { value: string | null; matchMode: string };
}

export function useNameFilters(): Ref<NameFilters> {
  return ref({
    parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
}
