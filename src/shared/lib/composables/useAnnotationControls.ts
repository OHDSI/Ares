import { Ref, ref } from "vue";

interface AnnotationControlsComposable {
  annotationsMode: Ref<boolean>;
  notesMode: Ref<boolean>;
  toggleAnnotationsMode: (arg: boolean) => void;
  toggleNotesMode: (arg: boolean) => void;
}

export default function useAnnotationControls(): AnnotationControlsComposable {
  const annotationsMode = ref(false);
  const notesMode = ref(false);
  function toggleAnnotationsMode(mode: boolean) {
    annotationsMode.value = mode;
  }
  function toggleNotesMode(mode: boolean) {
    notesMode.value = mode;
  }

  return {
    annotationsMode,
    notesMode,
    toggleAnnotationsMode,
    toggleNotesMode,
  };
}
