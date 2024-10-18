import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";

export default function getPercentage(
  value: number,
  array: RecordsCountType[]
): string {
  const denominator = array.reduce((acc, current) => {
    return acc + current.COUNT_VALUE;
  }, 0);
  return ((value / denominator) * 100).toFixed(2);
}
