import { RouteLocation } from "vue-router";
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
    if (item.mark.name === "layer_1_marks") {
      store.commit(SET_SELECTED_RECTANGLE, {
        item: item.datum,
        report: event.srcElement.offsetParent.id,
      });
    }
  });
};

export const showNotesEditDialogRightClick = function (result, store) {
  console.log(store);
  return result.view.addEventListener("contextmenu", (event, item) => {
    event.preventDefault();
    //Right click on brush
    if (item.mark.name === "secondBrush_brush") {
      const action = function (e, i) {
        return (title, description) => {
          store.dispatch(CREATE_SELECTION, {
            reportName: e.srcElement.offsetParent.id,
            date: new Date(),
            item: i.datum,
            title,
            description,
          });
        };
      };
      store.dispatch(SHOW_DIALOG, {
        show: true,
        data: null,
        action: action(event, item),
      });
    }
    //Right click on existing rectangle
    if (item.mark.name === "layer_1_marks") {
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
          newSelection: true,
        },
      });
    }
  });
};

export const setSelectionAreaSignal = function (result, store) {
  return result.view.addSignalListener(
    "secondBrush",
    debounce((signalName, event) => {
      store.commit(SET_CURRENT_SELECTION_AREA, { signalName, event });
    }, 100)
  );
};
