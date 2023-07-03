import { SET_SELECTED_RECTANGLE } from "@/widgets/notesPanel/model/store/mutations.type";
import {
  CREATE_SELECTION,
  EDIT_SELECTION,
  MOVE_SELECTION,
  SHOW_DATUM_NOTES,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import { OPEN_MENU } from "@/entities/contextMenu/model/store/actions.type";
import { debounce } from "lodash";

export const setRectangleLocationClick = function (view, route, store) {
  return view.addEventListener("click", (event, item) => {
    if (
      item.mark.name === "layer_1_marks" ||
      item.mark.name === "concat_0_layer_1_marks"
    ) {
      store.commit(SET_SELECTED_RECTANGLE, {
        item: item.datum,
        report: view.container().id,
      });
    } else if (item.mark.name === "root") {
      store.commit(SET_SELECTED_RECTANGLE, {
        item: {},
        report: view.container().id,
      });
    }
  });
};

const handleNotesBrush = (event, view, item, store) => {
  const action = (e, i) => (selection) => {
    store.dispatch(CREATE_SELECTION, {
      reportName: view.container().id,
      item: i.datum,
      selection,
    });
  };

  store.dispatch(SHOW_DIALOG, {
    show: true,
    data: null,
    action: action(event, item),
  });
};

const handleLayerMarks = (event, view, item, store) => {
  store.commit(SET_SELECTED_RECTANGLE, {
    item: item.datum,
    report: view.container().id,
  });

  store.dispatch(OPEN_MENU, {
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
      item: item.datum,
    },
  });
};

export const showNotesEditDialogRightClick = function (view, store) {
  return view.addEventListener("contextmenu", (event, item) => {
    const coordinates = store.getters.getCurrentSelectionArea.event;
    const currentSelection = store.getters.getResizeSelection;
    event.preventDefault();
    if (item.mark.name === "notesBrush_brush") {
      if (
        store.getters.getResizeSelection &&
        store.getters.getResizeSelection?.report == view.container().id
      ) {
        store.dispatch(EDIT_SELECTION, {
          report: view.container().id,
          save: true,
          data: {
            title: currentSelection.title,
            description: currentSelection.description,
            createdBy: currentSelection.createdBy,
            notes: currentSelection.notes,
            id: currentSelection.id,
            updatedAt: Date.now(),
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
          },
        });
      } else {
        handleNotesBrush(event, view, item, store);
      }
    } else if (
      item.mark.name === "layer_1_marks" ||
      item.mark.name === "concat_0_layer_1_marks"
    ) {
      handleLayerMarks(event, view, item, store);
    }
  });
};
export const setSelectionAreaSignal = function (view, store) {
  return view.addSignalListener(
    "notesBrush",
    debounce((signalName, event) => {
      if (Object.keys(event).length) {
        store.dispatch(SHOW_DATUM_NOTES, { signalName, event });
      }
    }, 100)
  );
};
