export function useGroupBanding() {
  function bandBg(index: number) {
    return index % 2 === 0 ? "var(--color-bg-subtle)" : "transparent";
  }

  function headerPt(index: number) {
    return {
      headerCell: {
        style: {
          background: bandBg(index),
          borderLeft: "2px solid var(--color-border-strong)",
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
