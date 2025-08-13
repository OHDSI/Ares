import dqdV1 from "./dqdV1";
import dqdV2 from "./dqdV2";

export default function deriveResults(data /*: CheckResults[]*/) {
  const version = data.filter(
    (d) => d.passed || d.isError || d.notApplicable
  ).length;

  const derivedResults = version ? dqdV2(data) : dqdV1(data);

  return derivedResults;
}
