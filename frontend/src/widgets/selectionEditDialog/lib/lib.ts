import { v4 as uuid } from "uuid";

export function createSelection(coordinates, params) {
  return {
    coordinates,
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
    id: params.id || undefined,
  };
}
