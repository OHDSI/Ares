<template>
  <div ref="containerRef" class="p-4">
    <h3 class="mx-10" v-if="props.title">{{ props.title }}</h3>
    <div
      ref="chartContainer"
      :style="`width: 100%; height: ${props.height || '300px'}`"
    ></div>
    <ContextMenu v-if="annotationMode" :items="actions" :chart-id="props.id" />
  </div>
</template>

<script setup lang="ts">
import ContextMenu from "@/entities/contextMenu/contextMenu.vue";
import { RouteLocationNormalizedLoaded } from "vue-router";
import { Annotation } from "@/shared/interfaces/Annotations";
import * as transform from "echarts-simple-transform";
import darkTheme from "./themes/dark-theme.json";
import lightTheme from "./themes/light-theme.json";

import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import {
  CREATE_SELECTION,
  DELETE_SELECTION,
  EDIT_SELECTION,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import { useStore } from "vuex";

import * as echarts from "echarts";
import { SET_SELECTED_RECTANGLE } from "@/widgets/notesPanel/model/store/mutations.type";
import { OPEN_MENU } from "@/entities/contextMenu/model/store/actions.type";
import { createSelection } from "@/widgets/selectionEditDialog/lib/lib";

echarts.registerTransform(transform.aggregate);

interface Props {
  title?: string;
  data: object[] | string[];
  id: string;
  conceptId?: string;
  chartSpec: (options: {
    minMax: string;
    zeroBaseline: boolean;
    data: never;
  }) => any;
  annotationMode?: boolean;
  clickListener?: (a: any, b: RouteLocationNormalizedLoaded, c: any) => void;
  annotations?: Annotation[];
  height?: string;
}

const containerRef = ref(null);
const elementWidth = ref(0);

const darkMode = computed(() => store.getters.getSettings.darkMode);

const zeroBaseline = computed(() => store.getters.getSettings.zeroBaseline);
const minMax = computed(() => store.getters.getSettings.minMax);

const colorMode = computed(() => (darkMode.value ? darkTheme : lightTheme));

const annotationsMode = computed(() => props.annotationMode);

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
    useConfirm: true,
    message: "Are you sure you want to remove this selection?",
  },
];

const store = useStore();
const props = withDefaults(defineProps<Props>(), {
  annotations: [],
});

const propAnnotations = computed(() => props.annotations);

const chartContainer = ref(null);
let myChart = null;
let tooltipElement = null;

function createAnnotation(annotation, metadata) {
  const { xMin, xMax, yMin, yMax } = annotation;

  const action = (event) => (selection) => {
    store.dispatch(CREATE_SELECTION, {
      chartId: props.id,
      event,
      selection,
      conceptId: props.conceptId,
    });
  };

  store.commit(SET_SELECTED_RECTANGLE, null);

  store.dispatch(SHOW_DIALOG, {
    show: true,
    data: null,
    coordinates: {
      xMin,
      xMax,
      yMin,
      yMax,
    },
    action: action(annotation),
  });
}

const initialOption = ref({});

let isSelecting = false;
let activeAnnotationKey = null;
let activeAnnotationMode = null;
let activeAnnotationTemp = null;
let dragStart = { x: 0, y: 0 };
let selectionStart = { x: 0, y: 0 };
let selectionEnd = { x: 0, y: 0 };

const getGridRect = () => {
  const gridComp = myChart.getModel().getComponent("grid", 0);
  return gridComp.coordinateSystem.getRect();
};

const getGridDataBounds = () => {
  const [xMin, xMax] = myChart
    .getModel()
    .getComponent("xAxis")
    .axis.scale.getExtent();

  const [yMin, yMax] = myChart
    .getModel()
    .getComponent("yAxis")
    .axis.scale.getExtent();

  return {
    xMin,
    xMax,
    yMin,
    yMax,
  };
};

const updateChart = () => {
  if (!annotationsMode.value) return;
  const graphicElements = [];

  props.annotations.forEach((annotation) => {
    const ann = annotation;
    const { xMin, xMax, yMin, yMax } = ann.coordinates;
    const { title, description } = ann.body;
    const topLeft = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      xMin,
      yMax,
    ]);
    const bottomRight = myChart.convertToPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [xMax, yMin]
    );
    const rectWidth = bottomRight[0] - topLeft[0];
    const rectHeight = bottomRight[1] - topLeft[1];

    graphicElements.push({
      type: "group",
      onmouseover: (e) => {
        tooltipElement.innerHTML = `Title: ${title}<br>Description: ${description}`;
        tooltipElement.style.left = `${e.event.pageX}px`;
        tooltipElement.style.top = `${e.event.pageY}px`;
        tooltipElement.style.opacity = 1;

        myChart.setOption({
          tooltip: { show: false },
        });
      },
      onmousemove: (e) => {
        tooltipElement.style.left = `${e.event.pageX + 10}px`;
        tooltipElement.style.top = `${e.event.pageY + 10}px`;
      },
      onmouseout: () => {
        tooltipElement.style.opacity = 0;
        myChart.setOption({
          tooltip: { show: true },
        });
      },
      oncontextmenu: (e) => {
        const event = e.event;
        event.preventDefault();
        store.commit(SET_SELECTED_RECTANGLE, {
          item: ann,
          report: props.id,
        });

        const menuData = {
          visibility: true,
          location: {
            x: event.clientX,
            y: event.clientY,
            element: props.id,
            event,
          },
          clickEventData: {
            reportName: props.id,
            date: new Date(),
            item: ann,
          },
        };

        store.dispatch(OPEN_MENU, menuData);
      },
      children: [
        {
          type: "rect",
          shape: {
            x: topLeft[0],
            y: topLeft[1],
            width: rectWidth,
            height: rectHeight,
          },

          style: {
            fill: darkMode.value
              ? "rgba(160, 203, 232, 0.12)"
              : "rgba(91, 138, 196, 0.15)",
            stroke: darkMode.value
              ? "rgba(176, 222, 255, 1)"
              : "rgba(44, 94, 149, 1)",
            lineWidth: 1,
          },
        },
        // Left handle
        {
          type: "circle",
          shape: {
            cx: topLeft[0],
            cy: topLeft[1] + rectHeight / 2,
            r: 5,
          },
          style: { fill: "#fff", stroke: "#000", lineWidth: 2 },
        },
        // Bottom handle
        {
          type: "circle",
          shape: {
            cx: topLeft[0] + rectWidth / 2,
            cy: bottomRight[1],
            r: 5,
          },
          style: { fill: "#fff", stroke: "#000", lineWidth: 2 },
        },
        // Top-right handle
        {
          type: "circle",
          shape: {
            cx: topLeft[0] + rectWidth,
            cy: topLeft[1],
            r: 5,
          },
          style: { fill: "#fff", stroke: "#000", lineWidth: 2 },
        },
      ],
    });
  });

  if (isSelecting) {
    const rect = getGridRect();
    const minX = rect.x;
    const maxX = rect.x + rect.width;
    const minY = rect.y;
    const maxY = rect.y + rect.height;
    const clampedEnd = {
      x: Math.min(Math.max(selectionEnd.x, minX), maxX),
      y: Math.min(Math.max(selectionEnd.y, minY), maxY),
    };
    const topLeft = {
      x: Math.min(selectionStart.x, clampedEnd.x),
      y: Math.min(selectionStart.y, clampedEnd.y),
    };
    const width = Math.abs(clampedEnd.x - selectionStart.x);
    const height = Math.abs(clampedEnd.y - selectionStart.y);

    graphicElements.push({
      type: "rect",
      shape: { x: topLeft.x, y: topLeft.y, width, height },
      style: {
        fill: darkMode.value
          ? "rgba(160, 203, 232, 0.1)"
          : "rgba(44, 94, 149, 0.15)",
      },
    });
  }

  const rect = getGridRect();
  const clippedGroup = {
    type: "group",
    clipPath: {
      type: "rect",
      shape: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
    },
    children: graphicElements,
  };

  let currentOption = myChart.getOption();
  if (!currentOption || !currentOption.grid) {
    currentOption = initialOption.value;
  }

  const newOption = {
    grid: currentOption.grid,
    xAxis: currentOption.xAxis,
    yAxis: currentOption.yAxis,
    dataZoom: currentOption.dataZoom,
    tooltip: currentOption.tooltip,
    series: currentOption.series,
    graphic: [clippedGroup],
    dataset: currentOption.dataset,
    legend: currentOption.legend,
    titles: currentOption.titles,
  };

  myChart.setOption(newOption, { notMerge: true });
};
const distance = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

const hitTestAnnotation = (ann, mouseX, mouseY) => {
  const { xMin, xMax, yMin, yMax } = ann.coordinates;

  const topLeft = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
    xMin,
    yMax,
  ]);
  const bottomRight = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
    xMax,
    yMin,
  ]);
  const rectWidth = bottomRight[0] - topLeft[0];
  const rectHeight = bottomRight[1] - topLeft[1];

  const leftHandle = { x: topLeft[0], y: topLeft[1] + rectHeight / 2 };
  const bottomHandle = { x: topLeft[0] + rectWidth / 2, y: bottomRight[1] };
  const topRightHandle = { x: topLeft[0] + rectWidth, y: topLeft[1] };

  const threshold = 10;
  if (distance(mouseX, mouseY, leftHandle.x, leftHandle.y) < threshold)
    return { mode: "resize-h", inside: false };
  if (distance(mouseX, mouseY, bottomHandle.x, bottomHandle.y) < threshold)
    return { mode: "resize-v", inside: false };
  if (distance(mouseX, mouseY, topRightHandle.x, topRightHandle.y) < threshold)
    return { mode: "move", inside: false };

  const inside =
    mouseX >= topLeft[0] &&
    mouseX <= topLeft[0] + rectWidth &&
    mouseY >= topLeft[1] &&
    mouseY <= topLeft[1] + rectHeight;
  return { mode: null, inside };
};

const handleMouseDown = (event) => {
  if (!annotationsMode.value) return;
  if (event.event.button === 2) return;
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;
  const rect = getGridRect();
  const minX = rect.x;
  const maxX = rect.x + rect.width;
  const minY = rect.y;
  const maxY = rect.y + rect.height;

  if (mouseX < minX || mouseX > maxX || mouseY < minY || mouseY > maxY) {
    return;
  }

  myChart.setOption({
    tooltip: {
      show: false,
    },
  });

  for (const annotation of props.annotations) {
    const { mode } = hitTestAnnotation(annotation, mouseX, mouseY);
    if (mode) {
      activeAnnotationKey = annotation.id;
      activeAnnotationMode = mode;
      dragStart = { x: mouseX, y: mouseY };
      return;
    }
  }

  isSelecting = true;
  selectionStart = { x: mouseX, y: mouseY };
  selectionEnd = { x: mouseX, y: mouseY };
  updateChart();
};

function editSelection(annotation) {
  if (!annotation) return;
  const newData = createSelection(annotation.coordinates, annotation);

  store.dispatch(EDIT_SELECTION, {
    report: props.id,
    save: true,
    data: newData,
  });
}

const handleMouseMove = (event) => {
  if (!annotationsMode.value) return;
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;

  if (activeAnnotationKey && activeAnnotationMode) {
    const ann = props.annotations.find(
      (annotation) => annotation.id === activeAnnotationKey
    );

    const prevData = myChart.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [dragStart.x, dragStart.y]
    );
    const currData = myChart.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [mouseX, mouseY]
    );
    const dx = currData[0] - prevData[0];
    const dy = currData[1] - prevData[1];

    if (activeAnnotationMode === "move") {
      ann.coordinates.xMin += dx;
      ann.coordinates.xMax += dx;
      ann.coordinates.yMin += dy;
      ann.coordinates.yMax += dy;
    } else if (activeAnnotationMode === "resize-h") {
      ann.coordinates.xMin += dx;
    } else if (activeAnnotationMode === "resize-v") {
      ann.coordinates.yMin += dy;
    }

    dragStart = { x: mouseX, y: mouseY };

    const dataBounds = getGridDataBounds();
    ann.coordinates.xMin = Math.max(ann.coordinates.xMin, dataBounds.xMin);
    ann.coordinates.xMax = Math.min(ann.coordinates.xMax, dataBounds.xMax);
    ann.coordinates.yMin = Math.max(ann.coordinates.yMin, dataBounds.yMin);
    ann.coordinates.yMax = Math.min(ann.coordinates.yMax, dataBounds.yMax);

    activeAnnotationTemp = ann;
    updateChart();
  } else if (isSelecting) {
    selectionEnd = { x: mouseX, y: mouseY };
    updateChart();
  }
};

const handleMouseUp = () => {
  if (!annotationsMode.value) return;
  myChart.setOption({
    tooltip: {
      show: true,
    },
  });
  if (activeAnnotationKey) {
    editSelection(activeAnnotationTemp);
    activeAnnotationTemp = null;
    activeAnnotationKey = null;
    activeAnnotationMode = null;
    return;
  }
  if (isSelecting) {
    isSelecting = false;
    const startData = myChart.convertFromPixel(
      { xAxisIndex: 0, yAxisIndex: 0 },
      [selectionStart.x, selectionStart.y]
    );
    const endData = myChart.convertFromPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      selectionEnd.x,
      selectionEnd.y,
    ]);

    let xMin = Math.min(startData[0], endData[0]);
    let xMax = Math.max(startData[0], endData[0]);
    let yMin = Math.min(startData[1], endData[1]);
    let yMax = Math.max(startData[1], endData[1]);

    const dataBounds = getGridDataBounds();
    xMin = Math.max(xMin, dataBounds.xMin);
    xMax = Math.min(xMax, dataBounds.xMax);
    yMin = Math.max(yMin, dataBounds.yMin);
    yMax = Math.min(yMax, dataBounds.yMax);

    if (Math.abs(xMax - xMin) > 0.01 && Math.abs(yMax - yMin) > 0.01) {
      createAnnotation(
        { xMin, xMax, yMin, yMax },
        {
          backgroundColor: "rgba(255,99,132,0.25)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
        }
      );
    }
    updateChart();
  }
};

watch(propAnnotations, () => {
  if (annotationsMode.value) {
    updateChart();
  }
});

watch(colorMode, () => {
  disposeChart();
  initChart();
  if (annotationsMode.value) {
    updateChart();
  }
});

watch(minMax, () => {
  disposeChart();
  initChart();
  if (annotationsMode.value) {
    updateChart();
  }
});

watch(zeroBaseline, () => {
  disposeChart();
  initChart();
  if (annotationsMode.value) {
    updateChart();
  }
});

watch(annotationsMode, () => {
  if (annotationsMode.value) {
    updateChart();
  } else {
    disposeChart();
    initChart();
  }
});

const initChart = function () {
  initialOption.value = props.chartSpec({
    data: props.data,
    minMax: minMax.value,
    zeroBaseline: zeroBaseline.value,
  });
  myChart = echarts.init(chartContainer.value, colorMode.value);
  tooltipElement = document.createElement("div");
  tooltipElement.style.position = "absolute";
  tooltipElement.style.padding = "6px 8px";
  tooltipElement.style.borderRadius = "4px";
  tooltipElement.style.pointerEvents = "none";
  tooltipElement.style.transition = "opacity 0.15s ease";
  tooltipElement.style.opacity = 0;

  tooltipElement.style.background = darkMode.value
    ? "rgba(33, 33, 33, 0.9)"
    : "rgba(255, 255, 255, 0.95)";

  tooltipElement.style.boxShadow = darkMode.value
    ? "0 4px 12px rgba(0, 0, 0, 0.7)"
    : "0 4px 12px rgba(0, 0, 0, 0.25)";

  tooltipElement.style.color = darkMode.value ? "#E0E0E0" : "#1A1A1A";

  document.body.appendChild(tooltipElement);

  myChart.setOption(initialOption.value, { notMerge: true });
  myChart.on("dataZoom", updateChart);

  myChart.on("legendselectchanged", updateChart);

  window.addEventListener("resize", function () {
    myChart.resize();
    updateChart();
  });

  const zr = myChart.getZr();
  zr.on("mousedown", handleMouseDown);
  zr.on("mousemove", handleMouseMove);
  zr.on("mouseup", handleMouseUp);
};

const disposeChart = function () {
  if (myChart) {
    myChart.off("dataZoom", updateChart);
    const zr = myChart.getZr();
    zr.off("mousedown", handleMouseDown);
    zr.off("mousemove", handleMouseMove);
    zr.off("mouseup", handleMouseUp);
    window.removeEventListener("resize", function () {
      myChart.resize();
    });
    myChart.dispose();
  }
  if (tooltipElement) {
    tooltipElement.remove();
  }
};

onMounted(() => {
  echarts.registerTheme("dark", darkTheme);
  echarts.registerTheme("light", lightTheme);

  initChart();
  updateChart();
});

onBeforeUnmount(() => {
  disposeChart();
});
</script>

<style scoped></style>
