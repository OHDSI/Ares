import * as files from "@/shared/config/files";

export default {
  reportsMissingFiles: {
    temporalCharacterization:
      "Temporal characterization file is not found. Please make sure it exists within the current release folder then try again",
    feasibility: "",
    networkPerformance:
      "Network performance file is not found. Please make sure it exists within the data directory then try again",
    networkDiversityReport: "1",
    networkUnmappedSourceCodes: "",
    networkConcept: "",
    networkDataQuality: "",
    cohorts: "",
    cohortReport: "",
    dataStrandReport: "",
    population: "No files found across all data sources",
    concept: "Seems like the data file for that particular concept is missing.",
    dataQuality: "",
    death: "",
    dataDensity: "",
    domainTable: "",
    metadata: "",
    observationPeriod: "",
    performance: "",
    person: "Person files not found",
    unmappedSourceCodes: "",
    dataQualityHistory: "",
    domainContinuity: "",
    sourceConceptOverlay: "",
    index: "Index file is missing. Please run AresIndexer then try again",
  },
  technicalError: {
    codeError:
      "Something went wrong. Please submit an issue on Github and describe the steps to reproduce it",
    networkError:
      "It seems that the server is not available at this time. Please make sure you have internet connection" +
      " and the server is running then reload the page",
  },
};
