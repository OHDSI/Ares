export default function sortByRange(
  array,
  sortOrder,
  rangeKey,
  outputOrderKey
) {
  return array
    .map((item) => ({
      ...item,
      [rangeKey]: item[rangeKey].split(`-`).map((num) => parseInt(num)),
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
      [rangeKey]: item[rangeKey].join(`-`),
      [outputOrderKey]: index,
    }));
}
