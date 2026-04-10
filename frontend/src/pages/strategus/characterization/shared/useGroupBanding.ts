import { computed } from "vue";
import { useStore } from "vuex";

export function useGroupBanding() {
  const store = useStore();
  const darkMode = computed(() => store.getters.getSettings.darkMode);

  function bandBg(index: number) {
    return index % 2 === 0
      ? darkMode.value
        ? "rgba(255,255,255,0.07)"
        : "rgba(0,0,0,0.06)"
      : "transparent";
  }

  const sepColor = computed(() =>
    darkMode.value ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
  );

  function headerPt(index: number) {
    return {
      headerCell: {
        style: {
          background: bandBg(index),
          borderLeft: `2px solid ${sepColor.value}`,
        },
      },
    };
  }

  function subPt(index: number) {
    return { headerCell: { style: { background: bandBg(index) } } };
  }

  function bodyPt(index: number) {
    return { bodyCell: { style: { background: bandBg(index) } } };
  }

  return { headerPt, subPt, bodyPt };
}
