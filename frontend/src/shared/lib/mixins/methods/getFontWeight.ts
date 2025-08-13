export const getFontWeight = function (decile: string): string {
  if (decile === "1") {
    return "font-black";
  } else if (decile === "2") {
    return "font-bold";
  } else if (decile === "3") {
    return "font-medium";
  } else if (decile === "9" || decile === "10") {
    return "font-light";
  } else {
    return "font-normal";
  }
};
