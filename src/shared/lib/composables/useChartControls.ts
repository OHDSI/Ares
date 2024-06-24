import { Ref, ref } from "vue";

interface AnnotationControlsComposable {
  annotationsMode: Ref<boolean>;
  notesMode: Ref<boolean>;
  showTable: Ref<boolean>;
  toggleTable: (arg: boolean) => void;
  toggleAnnotationsMode: (arg: boolean) => void;
  toggleNotesMode: (arg: boolean) => void;
}

export default function useChartControls(): AnnotationControlsComposable {
  const annotationsMode = ref(false);
  const notesMode = ref(false);
  const showTable = ref(false);

  function toggleTable(mode) {
    showTable.value = mode;
  }
  function toggleAnnotationsMode(mode: boolean) {
    annotationsMode.value = mode;
  }
  function toggleNotesMode(mode: boolean) {
    notesMode.value = mode;
  }

  return {
    annotationsMode,
    notesMode,
    showTable,
    toggleAnnotationsMode,
    toggleNotesMode,
    toggleTable,
  };
}
