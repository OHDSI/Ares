import * as d3 from "d3-time-format";
import { PERSON } from "@/shared/config/files";

export default function person(data) {
  const dateParse = d3.timeParse("%Y");
  const personData = data[PERSON];
  let genderMaleCount;
  let genderFemaleCount;
  const numPersons = personData.SUMMARY[1].ATTRIBUTE_VALUE;
  personData.BIRTH_YEAR_DATA.forEach((v, i) => {
    personData.BIRTH_YEAR_DATA[i].YEAR = dateParse(v.YEAR);
  });
  if (personData.GENDER_DATA[0].CONCEPT_NAME === "MALE") {
    genderMaleCount = personData.GENDER_DATA[0].COUNT_VALUE;
    genderFemaleCount = personData.GENDER_DATA[1].COUNT_VALUE;
  } else {
    genderMaleCount = personData.GENDER_DATA[1].COUNT_VALUE;
    genderFemaleCount = personData.GENDER_DATA[0].COUNT_VALUE;
  }

  return {
    numPersons,
    personData,
    genderMaleCount,
    genderFemaleCount,
    genderMalePct: genderMaleCount / numPersons,
    genderFemalePct: genderFemaleCount / numPersons,
  };
}
