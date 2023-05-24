import {
  SET_CURRENT_SELECTION_AREA,
  SET_SELECTED_RECTANGLE,
} from "@/widgets/notesPanel/model/store/mutations.type";
import {
  CREATE_SELECTION,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import { OPEN_MENU } from "@/entities/contextMenu/model/store/actions.type";
import { debounce } from "lodash";

export const setRectangleLocationClick = function (result, route, store) {
  return result.view.addEventListener("click", (event, item) => {
    if (
      item.mark.name === "layer_1_marks" ||
      item.mark.name === "concat_0_layer_1_marks"
    ) {
      store.commit(SET_SELECTED_RECTANGLE, {
        item: item.datum,
        report: event.srcElement.offsetParent.id,
      });
    } else if (item.mark.name === "root") {
      store.commit(SET_SELECTED_RECTANGLE, {
        item: {},
        report: event.srcElement.offsetParent.id,
      });
    }
  });
};

const handleNotesBrush = (event, item, store) => {
  const action = (e, i) => (title, description) => {
    store.dispatch(CREATE_SELECTION, {
      reportName: e.srcElement.offsetParent.id,
      item: i.datum,
      title,
      description,
    });
  };

  store.dispatch(SHOW_DIALOG, {
    show: true,
    data: null,
    action: action(event, item),
  });
};

const handleLayerMarks = (event, item, store) => {
  store.commit(SET_SELECTED_RECTANGLE, {
    item: item.datum,
    report: event.srcElement.offsetParent.id,
  });

  store.dispatch(OPEN_MENU, {
    visibility: true,
    location: {
      x: event.clientX,
      y: event.clientY,
      element: event.srcElement.offsetParent.id,
      event,
    },
    clickEventData: {
      reportName: event.srcElement.offsetParent.id,
      date: new Date(),
      item: item.datum,
    },
  });
};

export const showNotesEditDialogRightClick = function (result, store) {
  return result.view.addEventListener("contextmenu", (event, item) => {
    event.preventDefault();
    if (item.mark.name === "notesBrush_brush") {
      handleNotesBrush(event, item, store);
    } else if (
      item.mark.name === "layer_1_marks" ||
      item.mark.name === "concat_0_layer_1_marks"
    ) {
      handleLayerMarks(event, item, store);
    }
  });
};

export const setSelectionAreaSignal = function (result, store) {
  return result.view.addSignalListener(
    "notesBrush",
    debounce((signalName, event) => {
      store.commit(SET_CURRENT_SELECTION_AREA, { signalName, event });
    }, 100)
  );
};
