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

/** Trigger a file download from a Blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

// CSV utilities

/**
 * Parse a CSV string (with header row) into an array of objects.
 * Handles quoted fields that contain commas or escaped double-quotes (`""`).
 */
export function csvParse(data: string): Record<string, string>[] {
  if (!data) return undefined;

  const rows: string[][] = [];
  let field = "";
  let inQuotes = false;
  let currentRow: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    const next = data[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        currentRow.push(field);
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        if (ch === "\r") i++;
        currentRow.push(field);
        field = "";
        rows.push(currentRow);
        currentRow = [];
      } else {
        field += ch;
      }
    }
  }

  if (field !== "" || currentRow.length > 0) {
    currentRow.push(field);
    rows.push(currentRow);
  }

  const [headers, ...dataRows] = rows.filter((r) =>
    r.some((f) => f.trim() !== "")
  );
  return dataRows.map((row) =>
    Object.fromEntries(headers.map((h, i) => [h.trim(), row[i]?.trim() ?? ""]))
  );
}

// Auth utilities

/** Decode the payload of a JWT without verifying the signature. */
export function jwtDecode(token: string): Record<string, unknown> {
  const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(payload));
}

/** Debounced push of a search query param to the current route (300 ms). */
export const debouncedSearch = debounce(function (data: string) {
  const router = useRouter();
  router.push({ query: { search: data } });
}, 300);
