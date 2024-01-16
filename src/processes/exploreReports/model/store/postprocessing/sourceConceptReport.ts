import { SOURCE_CONCEPT } from "@/shared/config/files";
import * as d3 from "d3-time-format";
import { flatten, sumBy } from "lodash";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import environment from "@/shared/api/environment";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";

function combineObjectsByRelease(inputObject) {
  const resultArray = [];
  const sources = inputObject[CONCEPT_METADATA].map((data) => data.release);

  sources.forEach((release) => {
    const combinedData = {};

    for (const key in inputObject) {
      const fieldArray = inputObject[key];
      const matchingItem = fieldArray.find(
        (item) => item.release.release_id === release.release_id
      );
      combinedData[key] = matchingItem ? matchingItem.data : null;
    }

    resultArray.push({ release: release, data: combinedData });
  });

  return resultArray;
}

export default function sourceConceptOverlay(data) {
  let parsedResponses: MultipleFilesRawInterface<ConceptType>[];
  let conceptName;
  let conceptId;
  let numPersons;
  if (environment.DUCKDB_ENABLED === "true") {
    parsedResponses = combineObjectsByRelease(data);
    conceptName = parsedResponses[0].data[CONCEPT_METADATA][0].CONCEPT_NAME;
    conceptId = parsedResponses[0].data[CONCEPT_METADATA][0].CONCEPT_ID;
    numPersons = sumBy(
      parsedResponses,
      (item) => item.data[CONCEPT_METADATA][0].NUM_PERSONS
    );
  } else {
    parsedResponses = data[SOURCE_CONCEPT];
    conceptName = parsedResponses[0].data.CONCEPT_NAME[0];
    conceptId = parsedResponses[0].data.CONCEPT_ID[0];
    numPersons = sumBy(parsedResponses, (item) => item.data.NUM_PERSONS[0]);
  }
  const dateParse = d3.timeParse("%Y%m");
  if (!parsedResponses.length) return;
  const prevalence = parsedResponses.map((response) =>
    response.data.PREVALENCE_BY_MONTH.map((prevalence) => {
      return {
        ...prevalence,
        date: dateParse(String(prevalence.X_CALENDAR_MONTH)),
        release: response.release,
      };
    })
  );

  return {
    conceptName: conceptName,
    conceptId: conceptId,
    numPersons: numPersons,
    conceptData: flatten(prevalence),
  };
}
