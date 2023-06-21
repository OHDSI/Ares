export function mergeAndCompareByDate(obj1, obj2) {
  const mergedObject = { ...obj1 };

  Object.keys(obj2).forEach((key) => {
    if (!(key in mergedObject)) {
      mergedObject[key] = obj2[key];
    } else {
      if (new Date(obj2[key].date) > new Date(mergedObject[key].date)) {
        mergedObject[key] = obj2[key];
      }
    }
  });

  return mergedObject;
}

export const createNestedProperty = (obj, path) => {
  const newObj = { ...obj };
  let currentObj = newObj;

  for (let i = 0; i < path.length; i++) {
    if (i + 1 !== path.length) {
      currentObj[path[i]] = currentObj[path[i]] || {};
      currentObj = currentObj[path[i]];
    } else {
      currentObj[path[i]] = currentObj[path[i]] || [];
      currentObj = currentObj[path[i]];
    }
  }

  return newObj;
};
