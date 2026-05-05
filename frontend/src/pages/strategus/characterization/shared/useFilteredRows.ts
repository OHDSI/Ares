import { shallowRef, watch, onUnmounted } from "vue";
import type { Ref, WatchSource, ShallowRef } from "vue";

export function useFilteredRows<T>(
  computeRows: () => T[],
  sources: WatchSource[],
  tableRef: Ref<{ $el?: HTMLElement } | null>,
  debounceMs = 400
): { filteredRows: ShallowRef<T[]>; applyNow: () => void } {
  const filteredRows = shallowRef<T[]>([]) as ShallowRef<T[]>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function applyNow() {
    clearTimeout(timer!);
    timer = null;
    filteredRows.value = computeRows();
  }

  watch(
    sources,
    () => {
      clearTimeout(timer!);
      timer = setTimeout(() => {
        const tableEl = (tableRef.value as any)?.$el as HTMLElement | null;
        const active = document.activeElement as HTMLElement | null;
        const inputs = tableEl
          ? (Array.from(
              tableEl.querySelectorAll("input.fi-input")
            ) as HTMLElement[])
          : [];
        const idx = inputs.indexOf(active!);
        filteredRows.value = computeRows();
        requestAnimationFrame(() => {
          if (active && document.contains(active)) {
            active.focus();
          } else if (idx >= 0 && tableEl) {
            (
              tableEl.querySelectorAll("input.fi-input")[idx] as
                | HTMLElement
                | undefined
            )?.focus();
          }
        });
      }, debounceMs);
    },
    { deep: true }
  );

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return { filteredRows, applyNow };
}
