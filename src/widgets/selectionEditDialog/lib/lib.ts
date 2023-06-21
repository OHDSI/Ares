export function createSelection(event, params) {
  const coordinates = event;
  return {
    start:
      coordinates.start?.[0] ||
      coordinates.yearmonth_start?.[0] ||
      coordinates.yearmonthdate_start?.[0],
    end:
      coordinates.start?.[1] ||
      coordinates.yearmonth_start?.[1] ||
      coordinates.yearmonthdate_start?.[0],
    y: coordinates.y[0],
    y1: coordinates.y[1],
    title: params.title,
    description: params.description,
    notes: params.notes,
    id: Date.now(),
  };
}

export const createNewNote = function (title, description) {
  return {
    title,
    description,
    id: Date.now(),
  };
};
