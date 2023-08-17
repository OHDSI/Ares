export function createSelection(selection, params) {
  const coordinates = selection;
  return {
    xAxis: coordinates.xAxis,
    x1Axis: coordinates.x1Axis,
    yAxis: coordinates.yAxis,
    width: coordinates.width,
    height: coordinates.height,
    title: params.title,
    description: params.description,
    createdBy: params.createdBy,
    notes: params.notes,
    id: Date.now(),
    updatedAt: Date.now(),
  };
}

export const createNewNote = function (title, description, createdBy) {
  return {
    title,
    description,
    createdBy,
    id: Date.now(),
  };
};
