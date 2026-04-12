import { debounce } from "lodash";
import { useRouter } from "vue-router";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";

// Array utilities

/** Extract a single field from every item. Pass unique=true to deduplicate. */
export const getValuesArray = function (
  array: never[],
  val: string,
  unique?: boolean
): never[] {
  if (!array) return [];
  if (unique) {
    return [...new Set(array.map((d) => d[val]))];
  } else {
    return array.map((d) => d[val]);
  }
};

/**
 * Sort an array whose items contain a range string (e.g. "18-24") at rangeKey.
 * Writes a sequential index to outputOrderKey after sorting.
 */
export function sortByRange<Type>(
  array: Type[],
  sortOrder: string,
  rangeKey: string,
  outputOrderKey: string
): Type[] {
  return array
    .map((item) => ({
      ...item,
      [rangeKey]: item[rangeKey].split("-").map((num) => parseInt(num)),
    }))
    .sort((a, b) => {
      switch (sortOrder) {
        case "ascending":
          return (
            a[rangeKey][0] - b[rangeKey][0] || a[rangeKey][1] - b[rangeKey][1]
          );
        case "descending":
          return (
            b[rangeKey][0] - a[rangeKey][0] || b[rangeKey][1] - a[rangeKey][1]
          );
        default:
          throw new Error("Unresolvable sortOrder value specified");
      }
    })
    .map((item, index) => ({
      ...item,
      [rangeKey]: item[rangeKey].join("-"),
      [outputOrderKey]: index,
    }));
}

// Math utilities

/**
 * Percentage of value relative to the sum of COUNT_VALUE across the array.
 * Returns a 2-decimal string (e.g. "34.56").
 */
export function getPercentage(
  value: number,
  array: RecordsCountType[]
): string {
  const denominator = array.reduce(
    (acc, current) => acc + current.COUNT_VALUE,
    0
  );
  return ((value / denominator) * 100).toFixed(2);
}

// DOM utilities

export function openNewTab(link: string): void {
  window.open(link, "_blank").focus();
}

// UI utilities

/** Tailwind font-weight class derived from a decile string ("1"–"10"). */
export const getFontWeight = function (decile: string): string {
  if (decile === "1") return "font-black";
  if (decile === "2") return "font-bold";
  if (decile === "3") return "font-medium";
  if (decile === "9" || decile === "10") return "font-light";
  return "font-normal";
};

// Router utilities

/** Debounced push of a search query param to the current route (300 ms). */
export const debouncedSearch = debounce(function (data: string) {
  const router = useRouter();
  router.push({ query: { search: data } });
}, 300);
