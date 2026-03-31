import { computed, type Ref, type ComputedRef } from "vue";

interface TargetRow {
  databaseString: string;
  databaseIdString: string;
}

export function useAvailableDatabases(
  targetRowRef: Ref<TargetRow | null | undefined>
): ComputedRef<{ name: string; id: string }[]> {
  return computed(() => {
    const row = targetRowRef.value;
    if (!row) return [];
    const names = row.databaseString.split(", ");
    const ids = row.databaseIdString.split(", ");
    return names.map((name, i) => ({ name, id: ids[i] }));
  });
}
