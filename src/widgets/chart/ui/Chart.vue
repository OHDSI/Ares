<template>
  <div class="p-4">
    <h3 class="mx-10" v-if="props.title">{{ props.title }}</h3>
    <div v-resize="load" :id="id" :style="style"></div>
    <ContextMenu v-if="annotationMode" :items="actions" />
  </div>
</template>

<script lang="ts">
export default {
  name: "VegaChart",
};
</script>

<script setup lang="ts">
import { vegaLite } from "vega-embed";
import * as vega from "vega";
import { useStore } from "vuex";

import * as d3 from "d3";
import * as d3_annotations from "d3-svg-annotation";

import { darkTheme, lightTheme } from "@/widgets/chart/model/themes";
import { computed, watch, defineProps, onMounted, withDefaults } from "vue";
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
import { OPEN_MENU } from "@/entities/contextMenu/model/store/actions.type";
import { createSelection } from "@/widgets/selectionEditDialog/lib/lib";
import { Annotation } from "@/shared/interfaces/Annotations";

interface Props {
  title?: string;
  data: object[] | string[];
  id: string;
  width?: string;
  chartSpec: (a?: boolean, b?: boolean, c?: string) => any;
  annotationMode?: boolean;
  annotationsConfig?: {
    chartSpec: (a?: boolean, b?: boolean, c?: string) => any;
    annotationsParentElement: string;
    brushParentElement: string;
  };
  clickListener?: (a: any, b: RouteLocationNormalizedLoaded, c: any) => void;
  signalListener?: (
    a: any,
    b: any,
    c: any,
    d: any,
    e: any,
    f: any,
    g: any,
    h: any
  ) => void;
  annotations?: Annotation[];
}

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

const processedConfig = function (): TopLevelSpec {
  if (props.annotationMode) {
    return {
      ...props.annotationsConfig.chartSpec(
        store.getters.getSettings.zeroBaseline,
        store.getters.getSettings.minMax,
        store.getters.getSettings.darkMode ? "white" : "black"
      ),
      datasets: {
        conceptData: props.data,
        notesData: props.annotations ? [...props.annotations] : [],
      },
      config: store.getters.getSettings.darkMode ? darkTheme : lightTheme,
    };
  } else {
    return {
      ...props.chartSpec(
        store.getters.getSettings.zeroBaseline,
        store.getters.getSettings.minMax,
        store.getters.getSettings.darkMode ? "white" : "black"
      ),
      datasets: {
        conceptData: props.data,
      },
      config: store.getters.getSettings.darkMode ? darkTheme : lightTheme,
    };
  }
};

const vgSpec = computed(() => {
  return vegaLite.compile(processedConfig(), {}).spec;
});

let view;

const style = computed(function (): string {
  return props.width ? "width: " + props.width + "%" : "width: 100%";
});

function rerenderAnnotationsOnClick(view, makeAnnotations, parentContainer) {
  view.addEventListener("click", function () {
    renderAnnotations(view, makeAnnotations(view), parentContainer);
    initializeTooltip();
  });
}

const load = function (): void {
  view = new vega.View(vega.parse(vgSpec.value, {}), {
    renderer: "svg",
    container: `#${props.id}`,
    hover: true,
  }).tooltip(new Handler().call);

  if (props.signalListener && props.annotationMode) {
    props.signalListener(
      view,
      store,
      props.annotationsConfig.annotationsParentElement,
      props.annotationsConfig.brushParentElement,
      renderAnnotations,
      initializeAnnotationsInstance,
      initializeTooltip,
      initializeBrush
    );
    if (props.annotationMode) {
      rerenderAnnotationsOnClick(
        view,
        initializeAnnotationsInstance,
        props.annotationsConfig.annotationsParentElement
      );
    }
  }
  view.error = () => {
    return;
  };
  view.runAsync().then(() => {
    const annotations = initializeAnnotationsInstance(view);

    if (props.annotationMode) {
      renderAnnotations(
        view,
        annotations,
        props.annotationsConfig.annotationsParentElement
      );
      initializeTooltip();
      initializeBrush(view);
    }
  });
};

function getD3AnnotationObject(note, type, xScale, yScale) {
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

function getAnnotationsArray(view) {
  const type = d3_annotations.annotationCalloutRect;

  const xScale =
    view._runtime?.scales?.x?.value || view._runtime?.scales?.concat_0_x?.value;

  const yScale =
    view._runtime.scales?.y?.value || view._runtime?.scales?.concat_0_y?.value;

  return props.annotations.map((note) =>
    getD3AnnotationObject(note, type, xScale, yScale)
  );
}

function editSelection(xScale, yScale) {
  return function (annotation) {
    const x1Axis = xScale.invert(annotation._x);
    const x2Axis = xScale.invert(annotation.subject.width + annotation._x);
    const y1Axis = yScale.invert(annotation._y);
    const y2Axis = yScale.invert(annotation.subject.height + annotation._y);
    const width = xScale.invert(annotation.subject.width);
    const height = yScale.invert(annotation.subject.height);
    const note = annotation.data.originalNote;

    const newData = createSelection(
      { x1Axis, x2Axis, y1Axis, y2Axis, width, height },
      note
    );
    store.dispatch(EDIT_SELECTION, {
      report: view.container().id,
      save: true,
      data: newData,
    });
  };
}

function setSelectedAnnotation(annotation) {
  store.commit(SET_SELECTED_RECTANGLE, {
    item: annotation.data.originalNote,
    report: annotation.report,
  });
}

function initializeAnnotationsInstance(view) {
  const xScale =
    view._runtime?.scales?.x?.value || view._runtime?.scales?.concat_0_x?.value;

  const yScale =
    view._runtime.scales?.y?.value || view._runtime?.scales?.concat_0_y?.value;
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
    .on("subjectclick", setSelectedAnnotation)
    .on("dragend", editSelection(xScale, yScale))
    .annotations(getAnnotationsArray(view));
}

function handleContextMenu(event) {
  event.preventDefault();
  const originalNote = event.target.__data__.data.originalNote;
  store.commit(SET_SELECTED_RECTANGLE, {
    item: originalNote,
    report: view.container().id,
  });

  const menuData = {
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

  store.dispatch(OPEN_MENU, menuData);
}

function initializeTooltip() {
  const svg = d3.select(`#${props.id}`);
  svg.select(".tooltip").remove();
  const parseTime = d3.timeFormat("%B %d, %Y, %I:%M %p");
  const Tooltip = createTooltipContainer();

  const annotations = d3
    .select(`#${props.id} svg g .annotation-group .annotations`)
    .selectAll(".annotation");

  function createTooltipContainer() {
    return svg
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none")
      .style("border-radius", "10px")
      .style("position", "absolute")
      .style("padding", "8px");
  }

  function getTooltipMarkup(data, parseTime) {
    return `<span class="tooltip-field-title">Title:</span> ${
      data.originalNote.body.title
    }<br><span class="tooltip-field-title">Description:</span> ${
      data.originalNote.body.description
    }<br><span class="tooltip-field-title">Author</span>: ${
      data.originalNote.metadata.createdBy
    }<br><span class="tooltip-field-title">Created at:</span> ${parseTime(
      data.originalNote.metadata.createdAt
    )}<br><span class="tooltip-field-title">Updated at:</span> ${parseTime(
      data.originalNote.metadata.updatedAt
    )}`;
  }
  const handleMouseOver = function () {
    Tooltip.style("display", "initial");
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };

  const handleMouseMove = function (event, d) {
    Tooltip.html(getTooltipMarkup(d.data, parseTime))
      .style("left", event.layerX + 10 + "px")
      .style("top", event.layerY + 10 + "px");
  };
  const handleMouseLeave = function () {
    Tooltip.style("display", "none");
    d3.select(this).style("stroke", "none").style("opacity", 0.7);
  };

  annotations
    .on("contextmenu", handleContextMenu)
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseleave", handleMouseLeave);
}

function createAnnotation(xScale, yScale) {
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
      coordinates: {
        y1Axis: yScale.invert(event.selection[0][1]),
        y2Axis: yScale.invert(event.selection[1][1]),
        x1Axis: xScale.invert(event.selection[1][0]),
        x2Axis: xScale.invert(event.selection[0][0]),
        width: xScale.invert(event.selection[0][0] - event.selection[1][0]),
        height: yScale.invert(event.selection[1][1] - event.selection[0][1]),
      },
      action: action(event.selection),
    });
  };
}

function initializeBrush(view) {
  const xScale =
    view._runtime?.scales?.x?.value || view._runtime?.scales?.concat_0_x?.value;

  const yScale =
    view._runtime.scales?.y?.value || view._runtime?.scales?.concat_0_y?.value;
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
        .on("end", createAnnotation(xScale, yScale))
    );
}

function renderAnnotations(view, makeAnnotations, parentContainer) {
  const svg = d3.select(`#${props.id} svg ${parentContainer}`);

  svg.selectAll(".annotation-group").remove();

  svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
}

watch(updateValues, (): void => {
  load();
});

watch(computedNotes, (): void => {
  if (props.annotationMode) {
    const parentContainer = props.annotationsConfig.annotationsParentElement;
    renderAnnotations(
      view,
      initializeAnnotationsInstance(view),
      parentContainer
    );
    initializeTooltip();
    initializeBrush(view);
  }
});

onMounted((): void => {
  load();
});
</script>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
