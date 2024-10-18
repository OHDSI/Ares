import { v4 as uuid } from "uuid";

export function createSelection(coordinates, params) {
  return {
    coordinates: {
      x1Axis: coordinates?.x1Axis,
      x2Axis: coordinates?.x2Axis,
      y1Axis: coordinates?.y1Axis,
      y2Axis: coordinates?.y2Axis,
      width: coordinates?.width,
      height: coordinates?.height,
    },
    metadata: {
      createdBy: params.metadata.createdBy,
      createdAt: params.metadata.createdAt || Date.now(),
      updatedAt: Date.now(),
      scope: {
        type: params.metadata.scope.type,
        value: params.metadata.scope.value,
      },
    },
    body: {
      title: params.body.title,
      description: params.body.description,
      notes: params.body.notes,
    },
    id: params.id || uuid(),
  };
}
