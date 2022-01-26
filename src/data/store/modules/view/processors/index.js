import networkQualitySummary from "@/data/store/modules/view/processors/networkQualitySummary";
import { NETWORK_QUALITY_SUMMARY } from "@/data/services/getFilePath";

//todo move file pre-processing here according to the example

export default {
  [NETWORK_QUALITY_SUMMARY]: networkQualitySummary,
};
