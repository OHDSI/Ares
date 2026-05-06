import { computed } from "vue";
import type { Ref, ComputedRef, ShallowRef } from "vue";
import {
  parseFilterQuery,
  applyFilterQuery,
  applyFilterMatchMode,
  translateClauses,
} from "./filterQuery";
import { useFilteredRows } from "./useFilteredRows";

export function useTableFilter(
  getData: () => any[],
  dropdownFilters: Ref<Record<string, any>>,
  tableFilters: Ref<Record<string, { value: any; matchMode: string }>>,
  search: Ref<string>,
  keyMap: Ref<Record<string, string>> | ComputedRef<Record<string, string>>,
  tableRef: Ref<any>
): {
  filteredRows: ShallowRef<any[]>;
  applyNow: () => void;
  searchError: ComputedRef<string | null>;
  hasActiveFilters: ComputedRef<boolean>;
  clearFilters: () => void;
} {
  const searchError = computed<string | null>(() => {
    const q = search.value.trim();
    if (!q.startsWith(":")) return null;
    return parseFilterQuery(q).error;
  });

  function computeRows(): any[] {
    let rows = getData();
    for (const [key, val] of Object.entries(dropdownFilters.value)) {
      if (val != null) rows = rows.filter((r) => r[key] === val);
    }
    for (const [key, filter] of Object.entries(tableFilters.value)) {
      if (filter.value != null && filter.value !== "") {
        rows = rows.filter((r) =>
          applyFilterMatchMode(r[key], String(filter.value), filter.matchMode)
        );
      }
    }
    const q = search.value.trim();
    if (q) {
      if (q.startsWith(":")) {
        const parsed = parseFilterQuery(q);
        const result = translateClauses(parsed, keyMap.value);
        if (!result.error) {
          rows = applyFilterQuery(
            rows as Record<string, unknown>[],
            result
          ) as any[];
        }
      } else {
        const lower = q.toLowerCase();
        rows = rows.filter((r) =>
          Object.values(r).some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(lower)
          )
        );
      }
    }
    return rows;
  }

  const { filteredRows, applyNow } = useFilteredRows(
    computeRows,
    [tableFilters, dropdownFilters, search],
    tableRef
  );

  const hasActiveFilters = computed(() => {
    if (search.value.trim()) return true;
    if (Object.values(dropdownFilters.value).some((v) => v != null))
      return true;
    return Object.values(tableFilters.value).some(
      (f) => f.value != null && f.value !== ""
    );
  });

  function clearFilters() {
    search.value = "";
    for (const key of Object.keys(dropdownFilters.value)) {
      dropdownFilters.value[key] = null;
    }
    for (const filter of Object.values(tableFilters.value)) {
      filter.value = null;
    }
  }

  return {
    filteredRows,
    applyNow,
    searchError,
    hasActiveFilters,
    clearFilters,
  };
}
