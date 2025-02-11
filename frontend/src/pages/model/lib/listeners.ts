export const setSelectionAreaSignal = function (
  view,
  store,
  annotationsParentElement,
  brushParentElement,
  createAnnotations,
  makeAnnotations,
  createTooltip,
  createBrush
) {
  return view.addSignalListener("brush", () => {
    const annotations = makeAnnotations(view);
    createAnnotations(view, annotations, annotationsParentElement);
    createTooltip(view);
    createBrush(view, brushParentElement);
  });
};
