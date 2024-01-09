import * as d3 from "d3-time-format";
import { PERSON } from "@/shared/config/files";
import { PersonData } from "@/processes/exploreReports/model/interfaces/files/Person";
import { first } from "lodash";

export default function person(data) {
  const dateParse = d3.timeParse("%Y");
  const personData: PersonData = data[PERSON];
  let genderMaleCount = 0;
  let genderFemaleCount = 0;
  const maleAgeSex = personData.AGE_GENDER_DATA.filter(
    (value) => value.CONCEPT_NAME === "MALE"
  );
  const femaleAgeSex = personData.AGE_GENDER_DATA.filter(
    (value) => value.CONCEPT_NAME === "FEMALE"
  );
  const numPersons = parseInt(personData.SUMMARY[1].ATTRIBUTE_VALUE);
  personData.BIRTH_YEAR_DATA.forEach((v, i) => {
    if (typeof v.YEAR === "string") {
      personData.BIRTH_YEAR_DATA[i].YEAR = dateParse(v.YEAR);
    }
  });
  const firstGender = personData.GENDER_DATA[0]
    ? personData.GENDER_DATA[0]
    : { COUNT_VALUE: 0, CONCEPT_NAME: "none" };
  const secondGender = personData.GENDER_DATA[1]
    ? personData.GENDER_DATA[1]
    : { COUNT_VALUE: 0, CONCEPT_NAME: "none" };

  if (firstGender.CONCEPT_NAME === "MALE") {
    genderMaleCount = firstGender.COUNT_VALUE;
    genderFemaleCount = secondGender.COUNT_VALUE;
  } else {
    genderMaleCount = secondGender.COUNT_VALUE;
    genderFemaleCount = firstGender.COUNT_VALUE;
  }

  return {
    numPersons,
    personData,
    genderMaleCount,
    genderFemaleCount,
    genderMalePct: genderMaleCount / numPersons,
    genderFemalePct: genderFemaleCount / numPersons,
    maleAgeSex,
    femaleAgeSex,
  };
}
