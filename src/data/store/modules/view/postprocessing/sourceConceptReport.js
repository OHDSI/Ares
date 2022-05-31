import { SOURCE_CONCEPT } from "@/data/services/getFilePath";
import * as d3 from "d3-time-format";
import { flatten, sumBy } from "lodash";

export default function sourceConceptOverlay(data) {
  const parsedResponses = data[SOURCE_CONCEPT];
  const dateParse = d3.timeParse("%Y%m");
  if (!parsedResponses.length) return;
  const prevalence = parsedResponses.map((response) =>
    response.data.PREVALENCE_BY_MONTH.map((prevalence) => {
      return {
        ...prevalence,
        date: dateParse(prevalence.X_CALENDAR_MONTH),
        release: response.release,
      };
    })
  );

  return {
    conceptName: parsedResponses[0].data.CONCEPT_NAME[0],
    conceptId: parsedResponses[0].data.CONCEPT_ID[0],
    numPersons: sumBy(parsedResponses, (item) => item.data.NUM_PERSONS[0]),
    conceptData: flatten(prevalence),
  };
}
