export const setSelectionAreaSignal = function (
  view,
  { annotationsParentElement, brushParentElement },
  {
    renderAnnotations,
    initializeAnnotationsInstance,
    initializeTooltip,
    initializeBrush,
  }
) {
  return view.addSignalListener("brush", () => {
    const annotations = initializeAnnotationsInstance(view);
    renderAnnotations(annotations, annotationsParentElement);
    initializeTooltip(view);
    initializeBrush(view, brushParentElement);
  });
};
