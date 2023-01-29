import {
  Source,
  SourceRelease,
} from "@/processes/exploreReports/model/interfaces/files/SourceIndex";

export interface MultipleFilesRawInterface<Type> {
  data: Type;
  source?: Source;
  release?: SourceRelease;
}
