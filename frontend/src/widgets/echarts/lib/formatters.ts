export function kmbFormatter(v) {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  const ranges = [
    { divider: 1e9, suffix: "b" },
    { divider: 1e6, suffix: "m" },
    { divider: 1e3, suffix: "k" },
  ];

  for (const { divider, suffix } of ranges) {
    if (abs >= divider) {
      const num = v / divider;
      return num >= 100
        ? `${num.toFixed(0)}${suffix}`
        : num >= 10
        ? `${num.toFixed(1)}${suffix}`
        : `${num.toFixed(2)}${suffix}`;
    }
  }

  return v.toString();
}

export function dateFormatter(v) {
  const date = new Date(v.value);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
