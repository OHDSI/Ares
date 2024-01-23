export function mergeAndCompareByDate(obj1, obj2) {
  const mergedObject = {};

  // Merge obj1 into mergedObject
  Object.keys(obj1).forEach((key) => {
    if (obj2.hasOwnProperty(key)) {
      const arr1 = obj1[key];
      const arr2 = obj2[key];
      mergedObject[key] = mergeArraysByDate(arr1, arr2);
    } else {
      mergedObject[key] = obj1[key];
    }
  });

  // Merge obj2 into mergedObject
  Object.keys(obj2).forEach((key) => {
    if (!mergedObject.hasOwnProperty(key)) {
      mergedObject[key] = obj2[key];
    }
  });

  return mergedObject;
}

function mergeArraysByDate(arr1, arr2) {
  const mergedArray = [...arr1];

  arr2.forEach((obj2) => {
    const existingObjIndex = arr1.findIndex((obj1) => obj1.id === obj2.id);

    if (existingObjIndex === -1) {
      mergedArray.push(obj2);
    } else {
      const date1 = new Date(mergedArray[existingObjIndex].metadata.updatedAt);
      const date2 = new Date(obj2.metadata.updatedAt);

      if (date2 > date1) {
        mergedArray[existingObjIndex] = obj2;
      }
    }
  });

  return mergedArray;
}

export function mergeObjects(obj1, obj2, identifier = "id") {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    throw new Error("Both arguments must be objects");
  }

  const mergedObject = { ...obj1 };

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!mergedObject.hasOwnProperty(key)) {
        mergedObject[key] = obj2[key];
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        const mergedArray = mergeArraysOfObjects(
          obj1[key],
          obj2[key],
          identifier
        );
        mergedObject[key] = mergedArray;
      }
    }
  }

  return mergedObject;
}

function mergeArraysOfObjects(arr1, arr2, identifier) {
  const mergedArray = [];

  const uniqueIds = new Set();

  arr1.forEach((item1) => {
    const matchingItem = arr2.find(
      (item2) => item1[identifier] === item2[identifier]
    );

    if (matchingItem) {
      const mergedItem = mergeObjects(item1, matchingItem, identifier);
      mergedArray.push(mergedItem);
      uniqueIds.add(item1[identifier]);
      uniqueIds.add(matchingItem[identifier]);
    } else if (!uniqueIds.has(item1[identifier])) {
      mergedArray.push(item1);
      uniqueIds.add(item1[identifier]);
    }
  });

  arr2.forEach((item2) => {
    if (!uniqueIds.has(item2[identifier])) {
      mergedArray.push(item2);
      uniqueIds.add(item2[identifier]);
    }
  });

  return mergedArray;
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
