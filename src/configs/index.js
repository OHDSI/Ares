import { specRace } from "@/configs/charts/specRace";
import { specAgeSex } from "@/configs/charts/specAgeSex";
import { defOverview } from "@/configs/charts/defOverview";
import { specAgeBySex } from "@/configs/charts/specAgeBySex";
import { specOverview } from "@/configs/charts/specOverview";
import { specQuantity } from "@/configs/charts/specQuantity";
import { specBirthYear } from "@/configs/charts/specBirthYear";
import { specEthnicity } from "@/configs/charts/specEthnicity";
import { specAgeAtDeath } from "@/configs/charts/specAgeAtDeath";
import { specDatastrand } from "@/configs/charts/specDatastrand";
import { specDaysSupply } from "@/configs/charts/specDaysSupply";
import { specDeathByType } from "@/configs/charts/specDeathByType";
import { specDrugsByType } from "@/configs/charts/specDrugsByType";
import { specLengthOfEra } from "@/configs/charts/specLengthOfEra";
import { specRecordsByUnit } from "@/configs/charts/specRecordsByUnit";
import { defRecordsPerPerson } from "@/configs/charts/defRecordsPerPerson";
import { specConditionsByType } from "@/configs/charts/specConditionsByType";
import { specObservationByAge } from "@/configs/charts/specObservationByAge";
import { specObservationBySex } from "@/configs/charts/specObservationBySex";
import { specAgeAtFirstExposure } from "@/configs/charts/specAgeAtFirstExposure";
import { specDataQualityResults } from "@/configs/charts/specDataQualityResults";
import { specMeasurementsByType } from "@/configs/charts/specMeasurementsByType";
import { specObservationByMonth } from "@/configs/charts/specObservationByMonth";
import { specAgeAtFirstDiagnosis } from "@/configs/charts/specAgeAtFirstDiagnosis";
import { specVisitDurationByType } from "@/configs/charts/specVisitDurationByType";
import { specVisitStratification } from "@/configs/charts/specVisitStratification";
import { specAgeAtFirstOccurrence } from "@/configs/charts/specAgeAtFirstOccurrence";
import { specAgeAtFirstObservationBySource } from "@/configs/charts/specAgeAtFirstObservationBySource";
import { specCumulativeObservationBySource } from "@/configs/charts/specCumulativeObservationBySource";
import { specRecordProportionByMonthByRelease } from "@/configs/charts/specRecordProportionByMonthByRelease";
import { specDataQualityResultsByDomain } from "@/configs/charts/specDataQualityResultsByDomain";
import { specIssueStratificationByTable } from "@/configs/charts/specIssueStratificationByTable";
import { specDataQualityResultsByCategory } from "@/configs/charts/specDataQualityResultsByCategory";
import { specMeasurementValueDistribution } from "@/configs/charts/specMeasurementValueDistribution";
import { specRecordProportionByAgeSexYear } from "@/configs/charts/specRecordProportionByAgeSexYear";
import { specIssueStratificationByCategory } from "@/configs/charts/specIssueStratificationByCategory";
import { specMeasurementValueDistribution1 } from "@/configs/charts/specMeasurementValueDistribution1";
import { specDrugTypeStratification } from "@/configs/charts/specDrugTypeStratification";
import { specCumulativeObservation } from "@/configs/charts/specCumulativeObservation";
import { specAgeAtFirstObservation } from "@/configs/charts/specAgeAtFirstObservation";
import { specRecordProportionByMonth } from "@/configs/charts/specRecordProportionByMonth";
import { specPopulationByRelease } from "@/configs/charts/specPopulationByRelease";
import { specIssuesByRelease } from "@/configs/charts/specIssuesByRelease";
import { folders } from "@/configs/explorer/folders";
import { reports } from "@/configs/explorer/reports";

export const charts = {
  specRace,
  specAgeSex,
  specAgeBySex,
  defOverview,
  defRecordsPerPerson,
  specDrugTypeStratification,
  specOverview,
  specQuantity,
  specBirthYear,
  specEthnicity,
  specAgeAtDeath,
  specDatastrand,
  specDaysSupply,
  specDeathByType,
  specDrugsByType,
  specLengthOfEra,
  specRecordsByUnit,
  specConditionsByType,
  specObservationByAge,
  specObservationByMonth,
  specObservationBySex,
  specAgeAtFirstObservation,
  specAgeAtFirstObservationBySource,
  specAgeAtFirstDiagnosis,
  specAgeAtFirstExposure,
  specDataQualityResults,
  specMeasurementValueDistribution1,
  specMeasurementValueDistribution,
  specMeasurementsByType,
  specVisitStratification,
  specVisitDurationByType,
  specIssueStratificationByTable,
  specIssueStratificationByCategory,
  specAgeAtFirstOccurrence,
  specRecordProportionByMonthByRelease,
  specRecordProportionByMonth,
  specRecordProportionByAgeSexYear,
  specCumulativeObservationBySource,
  specDataQualityResultsByDomain,
  specDataQualityResultsByCategory,
  specCumulativeObservation,
  specPopulationByRelease,
  specIssuesByRelease
};

export const explorerConfigs = {
  folders,
  reports
};
