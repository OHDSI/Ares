import { debouncedSearch } from "@/shared/lib/mixins/methods/debouncedSearch";
import { getFontWeight } from "@/shared/lib/mixins/methods/getFontWeight";
import {
  getPaddedDate,
  padTo2Digits,
} from "@/shared/lib/mixins/methods/getPaddedDate";
import { getValuesArray } from "@/shared/lib/mixins/methods/getValuesArray";
import { navigateTo } from "@/shared/lib/mixins/methods/navigateTo";
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";
import { formatPercent } from "@/shared/lib/mixins/methods/formatPercent";
import { openNewTab } from "@/shared/lib/mixins/methods/openNewTab";

export const helpers = {
  debouncedSearch,
  getFontWeight,
  getPaddedDate,
  getValuesArray,
  navigateTo,
  formatComma,
  formatPercent,
  padTo2Digits,
  openNewTab,
};
