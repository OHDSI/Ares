import { computed } from "vue";
import type { ComputedRef } from "vue";
import { normalizeName } from "./filterQuery";

export const COVARIATE_FILTER_KEYS = [
  "covariateName",
  "domain",
  "concept",
  "timeWindow",
  "windowDays",
  "subType",
  "detail",
  "covariateId",
];

export function useDynamicColumnKeys<T>(
  getRefs: () => T[],
  options: {
    getName: (ref: T) => string;
    getId: (ref: T) => string;
    getN?: (ref: T) => number;
    statMap: Record<string, string>;
    staticKeys: string[];
    conditionalKeys?: () => string[];
  }
): {
  normKeys: ComputedRef<string[]>;
  keyMap: ComputedRef<Record<string, string>>;
  searchSuggestions: ComputedRef<string[]>;
} {
  const { getName, getId, getN, statMap, staticKeys, conditionalKeys } =
    options;

  const normKeys = computed<string[]>(() => {
    const list = getRefs();
    const count: Record<string, number> = {};
    for (const ref of list) {
      const n = normalizeName(getName(ref));
      count[n] = (count[n] ?? 0) + 1;
    }
    return list.map((ref) => {
      const n = normalizeName(getName(ref));
      return getN && count[n] > 1 ? `${n}_N${getN(ref)}` : n;
    });
  });

  const keyMap = computed<Record<string, string>>(() => {
    const list = getRefs();
    const map: Record<string, string> = {};
    list.forEach((ref, i) => {
      const norm = normKeys.value[i];
      for (const [stat, prefix] of Object.entries(statMap)) {
        map[`${norm}.${stat}`] = `${prefix}_${getId(ref)}`;
      }
    });
    return map;
  });

  const searchSuggestions = computed<string[]>(() => {
    const list = getRefs();
    const dynamic: string[] = [];
    list.forEach((_, i) => {
      const norm = normKeys.value[i];
      for (const stat of Object.keys(statMap)) {
        dynamic.push(`${norm}.${stat}`);
      }
    });
    const extra = conditionalKeys?.() ?? [];
    return [...staticKeys, ...dynamic, ...extra];
  });

  return { normKeys, keyMap, searchSuggestions };
}
