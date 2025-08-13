import { computed, ComputedRef } from "vue";
import { Store, useStore } from "vuex";
import { RouteLocation, useRoute } from "vue-router";
import { Annotation, Note } from "@/shared/interfaces/Annotations";

interface AnnotationComposable {
  annotations: ComputedRef<Annotation[]>;
  notes: ComputedRef<Note[]>;
}

export default function useAnnotations(
  reportId: string,
  conceptId: string = null
): AnnotationComposable {
  const store: Store<never> = useStore();
  const route: RouteLocation = useRoute();

  const currentScope = computed(
    (): { concept: string; source: string; release: string } => {
      return {
        concept: route.params.concept,
        source: store.getters.getSelectedSource.cdm_source_key,
        release: store.getters.getSelectedRelease?.release_id || null,
      };
    }
  );

  const annotations = computed((): Annotation[] => {
    const selections = store.getters.getNotes[reportId] || [];

    return selections.filter((val) => {
      const annotationScope = val.metadata.scope.value;
      const currentScopeConcept = currentScope.value.concept;

      let showSelection = true;
      if (annotationScope.concept) {
        showSelection = annotationScope.concept.includes(currentScopeConcept);
      }
      if (annotationScope.source && showSelection) {
        showSelection = annotationScope.source.includes(
          currentScope.value.source
        );
      }
      if (annotationScope.release && showSelection) {
        showSelection = annotationScope.release.includes(
          currentScope.value.release
        );
      }
      return showSelection;
    });
  });

  const notes = computed((): Note[] => {
    if (annotations.value.length) {
      return annotations.value.reduce((acc, val) => {
        const selection = val.id;
        const currentNotes = val.body.notes.map((note) => ({
          ...note,
          report: reportId,
          selection,
        }));
        return [...acc, ...currentNotes];
      }, []);
    } else {
      return [];
    }
  });

  return {
    annotations,
    notes,
  };
}
