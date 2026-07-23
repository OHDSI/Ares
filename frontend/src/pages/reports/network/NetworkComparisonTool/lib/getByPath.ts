export function getByPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce(
      (acc: any, key) =>
        acc === null || acc === undefined ? undefined : acc[key],
      obj,
    );
}
