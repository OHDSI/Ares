export const getValuesArray = function (
  array: never[],
  val: string,
  unique?: boolean
): never[] {
  if (unique) {
    return [...new Set(array.map((d) => d[val]))];
  } else {
    return array.map((d) => d[val]);
  }
};
