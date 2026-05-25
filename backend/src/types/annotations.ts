export interface AnnotationCoordinates {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface AnnotationScope {
  type: string;
  value: unknown;
}

export interface AnnotationMetadata {
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  scope?: AnnotationScope | null;
}

export interface AnnotationNote {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  lastUpdated: number;
}

export interface AnnotationBody {
  title: string;
  description: string;
  notes: AnnotationNote[];
}

export interface Annotation {
  id: string;
  coordinates?: AnnotationCoordinates | null;
  metadata: AnnotationMetadata;
  body: AnnotationBody;
}

export interface PaginatedAnnotation extends Omit<Annotation, "metadata"> {
  vizId: string;
  viz_name: string;
  viz_id: string;
  report_name: string;
  domain_name: string | null;
  concept_id: string | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  metadata: AnnotationScope | null;
}

export interface CreateAnnotationPayload {
  id?: string;
  chartId: string;
  chartName: string;
  reportName: string;
  domainName?: string;
  conceptId?: number;
  coordinates?: AnnotationCoordinates;
  metadata: AnnotationMetadata;
  body: AnnotationBody;
}

export interface UpdateAnnotationPayload {
  coordinates?: AnnotationCoordinates;
  metadata?: Pick<AnnotationMetadata, "scope">;
  body?: AnnotationBody;
}

export interface Chart {
  id: string;
  chart_id: string;
  chart_name: string;
  report_name: string;
  domain_name: string | null;
  concept_id: string | null;
}

export interface AnnotationsByChartId {
  [chartId: string]: Annotation[];
}
