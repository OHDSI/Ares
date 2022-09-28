export const getFontWeight = function (decile) {
  if (decile == 1) {
    return "font-weight-black";
  } else if (decile == 2) {
    return "font-weight-bold";
  } else if (decile == 3) {
    return "font-weight-medium";
  } else if (decile == 9 || decile == 10) {
    return "font-weight-light";
  } else {
    return "font-weight-regular";
  }
};
