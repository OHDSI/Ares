import { useRoute } from "vue-router";
import {
  useCharacterizationUrl,
  TABLE_URL_PREFIXES,
} from "./useCharacterizationUrl";

export interface TableUrlState {
  cols: string[] | null;
  search: string | null;
  showFilters: boolean;
  filters: Record<string, any> | null;
}

export function useTableUrlState(storageKey: string) {
  const route = useRoute();
  const { patchUrl } = useCharacterizationUrl();
  const prefix = TABLE_URL_PREFIXES[storageKey];

  function readState(): TableUrlState {
    const q = route.query;
    let filters: Record<string, any> | null = null;
    try {
      if (q[`${prefix}F`]) filters = JSON.parse(q[`${prefix}F`] as string);
    } catch {
      // malformed JSON — ignore
    }
    return {
      cols: q[`${prefix}Cols`]
        ? (q[`${prefix}Cols`] as string).split(",")
        : null,
      search: (q[`${prefix}Search`] as string) || null,
      showFilters: q[`${prefix}ShowF`] === "1" || filters != null,
      filters,
    };
  }

  function writeState(state: Partial<TableUrlState>) {
    const partial: Record<string, string | null> = {};

    if ("cols" in state) {
      partial[`${prefix}Cols`] = state.cols?.length
        ? state.cols.join(",")
        : null;
    }
    if ("search" in state) {
      partial[`${prefix}Search`] = state.search || null;
    }
    if ("showFilters" in state) {
      partial[`${prefix}ShowF`] = state.showFilters ? "1" : null;
    }
    if ("filters" in state) {
      if (state.filters) {
        const nonNull = Object.fromEntries(
          Object.entries(state.filters).filter(([, v]) => v != null && v !== "")
        );
        partial[`${prefix}F`] = Object.keys(nonNull).length
          ? JSON.stringify(nonNull)
          : null;
      } else {
        partial[`${prefix}F`] = null;
      }
    }

    patchUrl(partial);
  }

  return { readState, writeState };
}
