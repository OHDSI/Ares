import { PERSON } from "@/shared/config/files";
import { PersonData } from "@/processes/exploreReports/model/interfaces/files/Person";
import { compareSex, sexKey, sexLabel } from "@/shared/lib/chartColors";

export default function person(data) {
  const dateParse = (s) => new Date(+s, 0);
  const personData: PersonData = data[PERSON];
  const isSex = (value, sex) => sexKey(value.CONCEPT_NAME) === sex;
  const maleAgeSex = personData.AGE_GENDER_DATA.filter((value) =>
    isSex(value, "male"),
  );
  const femaleAgeSex = personData.AGE_GENDER_DATA.filter((value) =>
    isSex(value, "female"),
  );
  const genSexData = personData.AGE_GENDER_DATA;
  const numPersons = parseInt(personData.SUMMARY[1].ATTRIBUTE_VALUE);
  personData.BIRTH_YEAR_DATA.forEach((v, i) => {
    if (typeof v.YEAR === "string") {
      personData.BIRTH_YEAR_DATA[i].YEAR = dateParse(v.YEAR);
    }
  });
  const sexCounts = new Map<string, number>();
  personData.GENDER_DATA.forEach((value) => {
    const key = sexKey(value.CONCEPT_NAME);
    sexCounts.set(key, (sexCounts.get(key) ?? 0) + +value.COUNT_VALUE);
  });
  const genderCounts = [...sexCounts.keys()].sort(compareSex).map((key) => ({
    label: sexLabel(key),
    count: sexCounts.get(key),
    pct: sexCounts.get(key) / numPersons,
  }));
  const genderMaleCount = sexCounts.get("male") ?? 0;
  const genderFemaleCount = sexCounts.get("female") ?? 0;

  return {
    numPersons,
    personData,
    genderMaleCount,
    genderFemaleCount,
    genderMalePct: genderMaleCount / numPersons,
    genderFemalePct: genderFemaleCount / numPersons,
    genderCounts,
    maleAgeSex,
    femaleAgeSex,
    genSexData,
  };
}
