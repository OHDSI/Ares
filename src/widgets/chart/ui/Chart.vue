<template>
  <div ref="containerRef" class="p-4">
    <h3 class="mx-10" v-if="props.title">{{ props.title }}</h3>
    <div ref="chart" v-resize="loadChart" :id="id"></div>
    <ContextMenu
      :location="contextMenuLocation"
      v-if="annotationMode"
      :items="actions"
    />
  </div>
</template>

<script setup lang="ts">
import { vegaLite } from "vega-embed";
import * as vega from "vega";
import { useStore } from "vuex";

import * as d3 from "d3";
import * as d3_annotations from "d3-svg-annotation";

import { darkTheme, lightTheme } from "@/widgets/chart/lib/themes";
import { computed, watch, onMounted, withDefaults } from "vue";
import { RouteLocationNormalizedLoaded } from "vue-router";
import { TopLevelSpec } from "vega-lite";
import { Handler } from "vega-tooltip";
import ContextMenu from "@/entities/contextMenu/contextMenu.vue";
import {
  CREATE_SELECTION,
  DELETE_SELECTION,
  EDIT_SELECTION,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import { SET_SELECTED_RECTANGLE } from "@/widgets/notesPanel/model/store/mutations.type";
import { createSelection } from "@/widgets/selectionEditDialog/lib/lib";
import { Annotation } from "@/shared/interfaces/Annotations";
import { ref } from "vue";
import { View } from "vega";

interface Props {
  title?: string;
  data: object[] | string[];
  id: string;
  chartSpec: (a?: boolean, b?: boolean, c?: string) => any;
  annotationMode?: boolean;
  annotationsConfig?: {
    chartSpec: (a?: boolean, b?: boolean, c?: string) => any;
    annotationsParentElement: string;
    brushParentElement: string;
  };
  clickListener?: (a: any, b: RouteLocationNormalizedLoaded, c: any) => void;
  signalListener?: (a: any, b: any, c: any) => void;
  annotations?: Annotation[];
}

const containerRef = ref(null);
const elementWidth = ref(0);
const contextMenuLocation = ref(null);

const actions = [
  {
    title: "Edit selection details",
    action: () => {
      const action = function (selection) {
        store.dispatch(EDIT_SELECTION, {
          data: selection,
          save: true,
        });
      };
      store.dispatch(SHOW_DIALOG, {
        show: true,
        data: {
          selection: store.getters.getSelectedRectangle.item,
        },
        action,
      });
    },
  },
  {
    title: "Remove selection",
    action: () => {
      store.dispatch(DELETE_SELECTION);
    },
  },
];

const store = useStore();
const props = withDefaults(defineProps<Props>(), {
  annotations: [],
});

const updateValues = computed(() => {
  return {
    zeroBaseLine: store.getters.getSettings.zeroBaseline,
    minMax: store.getters.getSettings.minMax,
    darkMode: store.getters.getSettings.darkMode,
    annotationMode: props.annotationMode,
  };
});

const computedNotes = computed(() => {
  return props.annotations ? [...props.annotations] : [];
});

function processedConfig(): TopLevelSpec {
  const commonSpec = props.annotationMode
    ? props.annotationsConfig.chartSpec
    : props.chartSpec;
  const datasets = { conceptData: props.data };
  if (props.annotationMode) {
    datasets.notesData = props.annotations ? [...props.annotations] : [];
  }

  return {
    ...commonSpec(
      store.getters.getSettings.zeroBaseline,
      store.getters.getSettings.minMax,
      store.getters.getSettings.darkMode ? "white" : "black"
    ),
    datasets,
    config: store.getters.getSettings.darkMode ? darkTheme : lightTheme,
  };
}
const vgSpec = computed(() => {
  return vegaLite.compile(processedConfig(), {}).spec;
});

let view;

//Chart rendering

function createViewInstance() {
  return new vega.View(vega.parse(vgSpec.value, {}), {
    renderer: "svg",
    container: `#${props.id}`,
    hover: true,
  }).tooltip(new Handler().call);
}

function updateChartWidth() {
  if (containerRef.value) {
    const { width } = containerRef.value.getClientRects();
    elementWidth.value = width;
    const chartSvg = d3.select(`#${props.id} svg`);
    chartSvg.attr("width", `${width}px`);
  }
}
//required for setting the chart back to its desired width. Otherwise, would cause overflow issues.
function setupChartResizeListener(): void {
  view.addEventListener("click", function () {
    setTimeout(() => {
      updateChartWidth();
    }, 0);
  });
}

async function runViewAsync(): Promise<void> {
  try {
    view.error = (err) => {
      console.error(err);
    };
    await view.runAsync();
    updateChartWidth();
  } catch (err) {
    console.error(err);
  }
}

//Annotations rendering
function getScales() {
  return {
    xScale:
      view._runtime?.scales?.x?.value ||
      view._runtime?.scales?.concat_0_x?.value,
    yScale:
      view._runtime.scales?.y?.value ||
      view._runtime?.scales?.concat_0_y?.value,
  };
}

function getRenderedAnnotationsObject() {
  return d3
    .select(`#${props.id} svg g .annotation-group .annotations`)
    .selectAll(".annotation");
}

function createD3AnnotationObject(note, type, { xScale, yScale }) {
  return {
    type: type,
    disable: ["note", "connector"],
    data: {
      x: note.coordinates.x1Axis,
      y: note.coordinates.y1Axis,
      report: view.container().id,
      originalNote: note,
    },
    id: note.id,
    subject: {
      width: xScale(note.coordinates.x2Axis) - xScale(note.coordinates.x1Axis),
      height: yScale(note.coordinates.y2Axis) - yScale(note.coordinates.y1Axis),
    },
  };
}

function createAnnotationsArray() {
  const type = d3_annotations.annotationCalloutRect;

  const { xScale, yScale } = getScales();

  return props.annotations.map((note) =>
    createD3AnnotationObject(note, type, { xScale, yScale })
  );
}

function calculateUpdatedCoordinates(annotation) {
  const { xScale, yScale } = getScales();
  return {
    x1Axis: xScale.invert(annotation._x),
    x2Axis: xScale.invert(annotation.subject.width + annotation._x),
    y1Axis: yScale.invert(annotation._y),
    y2Axis: yScale.invert(annotation.subject.height + annotation._y),
    width: xScale.invert(annotation.subject.width),
    height: yScale.invert(annotation.subject.height),
  };
}

function dispatchEditSelection(newData) {
  store.dispatch(EDIT_SELECTION, {
    report: view.container().id,
    save: true,
    data: newData,
  });
}

function updateSelection() {
  return function (annotation) {
    const coordinates = calculateUpdatedCoordinates(annotation);
    const note = annotation.data.originalNote;
    const newData = createSelection(coordinates, note);
    dispatchEditSelection(newData);
  };
}

function updateSelectedAnnotation(annotation) {
  store.commit(SET_SELECTED_RECTANGLE, {
    item: annotation.data.originalNote,
    report: annotation.data.report,
  });
}

function createAnnotationsInstance() {
  const { xScale, yScale } = getScales();
  return d3_annotations
    .annotation()
    .editMode(true)
    .notePadding(15)
    .accessors({
      x: (d) => xScale(d.x),
      y: (d) => yScale(d.y),
    })
    .accessorsInverse({
      x: (d) => xScale.invert(d.x),
      y: (d) => yScale.invert(d.y),
    })
    .on("subjectclick", updateSelectedAnnotation)
    .on("dragend", updateSelection())
    .annotations(createAnnotationsArray());
}

function getNewAnnotationCoordinates(selection) {
  const { xScale, yScale } = getScales();
  return {
    y1Axis: yScale.invert(selection[0][1]),
    y2Axis: yScale.invert(selection[1][1]),
    x1Axis: xScale.invert(selection[1][0]),
    x2Axis: xScale.invert(selection[0][0]),
    width: xScale.invert(selection[0][0] - selection[1][0]),
    height: yScale.invert(selection[1][1] - selection[0][1]),
  };
}

function createAnnotation() {
  return function (event) {
    if (!event.selection) {
      return;
    }
    const action = (event) => (selection) => {
      store.dispatch(CREATE_SELECTION, {
        reportName: view.container().id,
        event,
        selection,
      });
    };
    store.commit(SET_SELECTED_RECTANGLE, null);
    store.dispatch(SHOW_DIALOG, {
      show: true,
      data: null,
      coordinates: getNewAnnotationCoordinates(event.selection),
      action: action(event.selection),
    });
  };
}

function renderAnnotations(makeAnnotations, parentContainer) {
  const svg = d3.select(`#${props.id} svg ${parentContainer}`);

  svg.selectAll(".annotation-group").remove();

  svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
}

function refreshAnnotationsOnClick(view: View) {
  view.addEventListener("click", function () {
    setupAnnotationMode();
  });
}

//Context menu

function contextMenuHandler(event) {
  event.preventDefault();
  const originalNote = event.target.__data__.data.originalNote;
  store.commit(SET_SELECTED_RECTANGLE, {
    item: originalNote,
    report: view.container().id,
  });

  contextMenuLocation.value = {
    visibility: true,
    location: {
      x: event.clientX,
      y: event.clientY,
      element: view.container().id,
      event,
    },
    clickEventData: {
      reportName: view.container().id,
      date: new Date(),
      item: originalNote,
    },
  };
}

function addContextMenuListener() {
  const annotations = getRenderedAnnotationsObject();

  annotations.on("contextmenu", contextMenuHandler);
}

//tooltip

function createTooltipContainer(svg) {
  return svg
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none")
    .style("border-radius", "10px")
    .style("position", "absolute")
    .style("padding", "8px");
}

function getTooltipMarkup(data) {
  const parseTime = d3.timeFormat("%B %d, %Y, %I:%M %p");

  return `
    <span class="tooltip-field-title">Title:</span> ${
      data.originalNote.body.title
    }
    <br>
    <span class="tooltip-field-title">Description:</span> ${
      data.originalNote.body.description
    }
    <br>
    <span class="tooltip-field-title">Author</span>: ${
      data.originalNote.metadata.createdBy
    }
    <br>
    <span class="tooltip-field-title">Created at:</span> ${parseTime(
      data.originalNote.metadata.createdAt
    )}
    <br>
    <span class="tooltip-field-title">Updated at:</span> ${parseTime(
      data.originalNote.metadata.updatedAt
    )}`;
}

function handleMouseOver(tooltip) {
  return function () {
    tooltip.style("display", "initial");
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };
}

function handleMouseMove(tooltip) {
  return function (event, d) {
    tooltip
      .html(getTooltipMarkup(d.data))
      .style("left", event.layerX + 10 + "px")
      .style("top", event.layerY + 10 + "px");
  };
}
function handleMouseLeave(tooltip) {
  return function () {
    tooltip.style("display", "none");
    d3.select(this).style("stroke", "none").style("opacity", 0.7);
  };
}

function createTooltip() {
  const svg = d3.select(`#${props.id}`);
  svg.select(".tooltip").remove();
  const Tooltip = createTooltipContainer(svg);

  const annotations = getRenderedAnnotationsObject();

  annotations
    .on("mouseover", handleMouseOver(Tooltip))
    .on("mousemove", handleMouseMove(Tooltip))
    .on("mouseleave", handleMouseLeave(Tooltip));
}

function createBrush() {
  const { xScale, yScale } = getScales();
  const parentContainer = props.annotationsConfig.brushParentElement;
  const svg = d3.select(`#${props.id} svg ${parentContainer}`);

  svg.selectAll(".brush").remove();

  d3.select(`#${props.id} svg ${parentContainer}`)
    .append("g")
    .attr("class", "brush")
    .call(
      d3
        .brush()
        .extent([
          [xScale.range()[0], yScale.range()[1]],
          [xScale.range()[1], yScale.range()[0]],
        ])
        .on("end", createAnnotation())
    );
}

//setup

function setupSignalListener(): void {
  const annotationsParentElement =
    props.annotationsConfig?.annotationsParentElement;
  const brushParentElement = props.annotationsConfig?.brushParentElement;
  const renderFunctions = {
    renderAnnotations,
    initializeAnnotationsInstance: createAnnotationsInstance,
    initializeTooltip: createTooltip,
    initializeBrush: createBrush,
  };

  const elementIds = {
    annotationsParentElement,
    brushParentElement,
  };

  if (props.signalListener && props.annotationMode) {
    props.signalListener(view, elementIds, renderFunctions);
    refreshAnnotationsOnClick(view);
  }
}

function setupAnnotationMode(): void {
  const annotations = createAnnotationsInstance();
  const parentElement = props.annotationsConfig.annotationsParentElement;

  renderAnnotations(annotations, parentElement);
  createTooltip();
  addContextMenuListener();
  createBrush();
}

async function loadChart(): Promise<void> {
  view = createViewInstance();
  setupSignalListener();
  await runViewAsync();
  setupChartResizeListener();

  if (props.annotationMode) {
    setupAnnotationMode();
  }
}

watch(updateValues, (): void => {
  loadChart();
});

watch(computedNotes, (): void => {
  if (props.annotationMode) {
    setupAnnotationMode();
  }
});

onMounted((): void => {
  loadChart();
});
</script>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
