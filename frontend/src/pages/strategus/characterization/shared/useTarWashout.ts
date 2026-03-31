import { computed, type Ref, type ComputedRef } from "vue";

interface Outcome {
  tarNames?: string;
  tarStrings?: string;
  outcomeWashoutDays?: string;
}

interface TarValue {
  riskWindowStart: string;
  startAnchor: string;
  riskWindowEnd: string;
  endAnchor: string;
}

interface TarWashout {
  tarOptions: ComputedRef<string[]>;
  tarValues: ComputedRef<TarValue[]>;
  washoutOptions: ComputedRef<string[]>;
}

export function useTarWashout(
  outcomeRef: Ref<Outcome | null | undefined>
): TarWashout {
  const tarOptions = computed(() => {
    const o = outcomeRef.value;
    if (!o?.tarNames) return [];
    return o.tarNames.split(":");
  });

  const tarValues = computed(() => {
    const o = outcomeRef.value;
    if (!o?.tarStrings) return [];
    return o.tarStrings.split(":").map((s) => {
      const [riskWindowStart, startAnchor, riskWindowEnd, endAnchor] =
        s.split("/");
      return { riskWindowStart, startAnchor, riskWindowEnd, endAnchor };
    });
  });

  const washoutOptions = computed(() => {
    const o = outcomeRef.value;
    if (!o?.outcomeWashoutDays) return [];
    return o.outcomeWashoutDays.split(":");
  });

  return { tarOptions, tarValues, washoutOptions };
}
