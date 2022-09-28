import { debouncedSearch } from "@/shared/lib/mixins/methods/debouncedSearch";
import { getFontWeight } from "@/shared/lib/mixins/methods/getFontWeight";
import { getPaddedDate } from "@/shared/lib/mixins/methods/getPaddedDate";
import { getValuesArray } from "@/shared/lib/mixins/methods/getValuesArray";
import { navigateTo } from "@/shared/lib/mixins/methods/navigateTo";
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";
import { formatPercent } from "@/shared/lib/mixins/methods/formatPercent";

export const mixins = {
  methods: {
    debouncedSearch,
    getFontWeight,
    getPaddedDate,
    getValuesArray,
    navigateTo,
    formatComma,
    formatPercent,
  },
};
