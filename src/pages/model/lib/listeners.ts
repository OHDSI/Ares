import { SET_SELECTED_RECTANGLE } from "@/widgets/notesPanel/model/store/mutations.type";
import {
  CREATE_SELECTION,
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
  const action = (e, i) => (title, description) => {
    store.dispatch(CREATE_SELECTION, {
      reportName: view.container().id,
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
    event.preventDefault();
    if (item.mark.name === "notesBrush_brush") {
      handleNotesBrush(event, view, item, store);
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
        store.dispatch(SHOW_DATUM_NOTES, { signalName, event }).then(() => {
          const action = (view, store) => (title, description) => {
            store.dispatch(CREATE_SELECTION, {
              reportName: view.container().id,
              item: "",
              title,
              description,
            });
          };

          store.dispatch(SHOW_DIALOG, {
            show: true,
            data: null,
            action: action(view, store),
          });
        });
      }
    }, 300)
  );
};
