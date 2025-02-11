export interface Annotation {
  body: {
    description: string;
    title: string;
    notes: Note[];
  };
  coordinates: {
    height: number;
    width: number;
    x1Axis: number;
    x2Axis: number;
    y1Axis: number;
    y2Axis: number;
  };
  id: string;
  metadata: {
    createdAt: number;
    createdBy: string;
    updatedAt: string;
    scope: {
      type: string;
      value: { source: string[]; concept: string[]; release: string[] };
    };
  };
}

export interface Note {
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  title: string;
  description: string;
  id: string;
  report?: string;
  selection?: string;
}
