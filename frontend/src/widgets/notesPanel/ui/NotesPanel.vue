<template>
  <div class="notes-panel">
    <div class="notes-panel-header">
      <span class="notes-panel-label">Notes</span>
      <span class="notes-panel-count">{{ notes.length }}</span>
    </div>
    <div v-if="notes.length" class="notes-scroll">
      <div
        v-for="note in notes"
        :key="note.id ?? note.createdAt"
        class="note-card"
      >
        <div class="note-card-title">{{ note.title || "Untitled" }}</div>
        <p class="note-card-desc">{{ note.description }}</p>
        <div class="note-card-meta">
          <span>{{ note.createdBy }}</span>
          <span class="note-meta-dot" />
          <span>{{ formatDate(note.updatedAt || note.createdAt) }}</span>
        </div>
      </div>
    </div>
    <div v-else class="notes-empty">No notes for this selection.</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { Note } from "@/shared/interfaces/Annotations";

interface Props {
  notes: Note[];
}

const props = defineProps<Props>();
const store = useStore();

const notes = computed(() => {
  const selectionId = store.getters.getSelectedRectangle?.item?.id;
  return (props.notes ?? []).filter((note) => note.selection === selectionId);
});

function formatDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}
</script>

<style scoped>
.notes-panel {
  border-top: 1px solid var(--color-border-subtle);
  padding: 0.875rem 1rem 1rem;
  background: var(--color-bg-surface);
}

.notes-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.notes-panel-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.notes-panel-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-subtle);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: 9999px;
  padding: 0 0.4rem;
  line-height: 1.5;
}

.notes-scroll {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 4px;
}

.note-card {
  flex-shrink: 0;
  width: 260px;
  background: var(--color-bg-raised);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.note-card-title {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-card-desc {
  font-size: 0.8125rem;
  color: var(--color-text-body);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.note-card-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text-subtle);
  margin-top: 0.25rem;
}

.note-meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-subtle);
  flex-shrink: 0;
}

.notes-empty {
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
}
</style>
