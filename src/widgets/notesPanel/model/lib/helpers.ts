export function createSelection(event, params) {
  const coordinates = event;
  return {
    start:
      coordinates.start?.[0] ||
      coordinates.yearmonth_start?.[0] ||
      coordinates.yearmonthdate_start?.[0],
    end:
      coordinates.start?.[1] ||
      coordinates.yearmonth_start?.[1] ||
      coordinates.yearmonthdate_start?.[0],
    y: coordinates.y[0],
    y1: coordinates.y[1],
    title: params.title,
    description: params.description,
    notes: [],
    id: Date.now(),
  };
}

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

export const createNewNote = function (title, description) {
  return {
    title,
    description,
    id: Date.now(),
  };
};

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
