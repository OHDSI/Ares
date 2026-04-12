<template>
  <div class="tool-root">
    <div class="panel-header" @mousedown.stop="startDrag">
      <button
        class="panel-back-btn"
        @click.stop="$emit('back')"
        title="Back to Dev Tools"
      >
        <i class="pi pi-angle-left" />
      </button>

      <div class="panel-tabs">
        <span class="panel-tab panel-tab--active">
          <span
            class="panel-title-dot"
            :class="logsEntries.length ? 'dot-active' : 'dot-idle'"
          />
          Logs
          <span v-if="logsEntries.length" class="tab-count tab-count--dim">
            {{ logsEntries.length }}
          </span>
        </span>
      </div>

      <div class="panel-header-actions">
        <button
          class="panel-btn"
          :class="{ 'is-paused': logsPaused }"
          @click.stop="logsPaused = !logsPaused"
          title="Pause polling"
        >
          <i :class="logsPaused ? 'pi pi-play' : 'pi pi-pause'" />
        </button>
        <button
          class="panel-btn"
          @click.stop="clearLogs"
          title="Clear log buffer"
        >
          <i class="pi pi-trash" />
        </button>
        <button
          class="panel-btn panel-btn--close"
          @click.stop="$emit('close')"
          title="Close"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </div>

    <div class="panel-body">
      <div v-if="logsError" class="panel-error">{{ logsError }}</div>
      <div v-else-if="!logsEntries.length" class="panel-empty">
        <i class="pi pi-align-left panel-empty-icon" />
        <span>No log entries</span>
      </div>
      <div v-else ref="logsListRef" class="logs-list">
        <div
          v-for="(entry, i) in logsEntries"
          :key="i"
          class="log-entry"
          :class="`log-entry--${entry.level}`"
        >
          <span class="log-time">{{ formatLogTime(entry.timestamp) }}</span>
          <span class="log-level" :class="`log-level--${entry.level}`">{{
            entry.level
          }}</span>
          <span class="log-message">{{ entry.message }}</span>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <span class="footer-info">
        {{
          `polling every ${intervalSec}s · ${
            logsEntries.length
          } entries (max 500)${
            logsLastUpdated ? ` · updated ${logsLastUpdated}` : ""
          }`
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, toRef, onMounted } from "vue";
import { useLogsTool } from "../composables/useLogsTool";
import { formatLogTime } from "../utils/formatters";

const props = defineProps({
  intervalSec: { type: Number, default: 2 },
});

defineEmits(["back", "close"]);

const startDrag = inject("startDrag");

const {
  logsEntries,
  logsError,
  logsPaused,
  logsLastUpdated,
  logsListRef,
  start,
  clearLogs,
} = useLogsTool(toRef(props, "intervalSec"));

onMounted(start);
</script>

<style scoped>
.tool-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
  height: 100%;
  padding: 6px 0;
}

.log-entry {
  display: grid;
  grid-template-columns: 68px 44px 1fr;
  gap: 6px;
  align-items: baseline;
  padding: 3px 10px;
  font-size: 11px;
  line-height: 1.5;
  border-radius: 3px;
}
.log-entry:hover {
  background: var(--w-bg-item);
}
.log-entry--error {
  background: var(--w-bg-err);
}
.log-entry--warn {
  background: var(--w-bg-wait);
}

.log-time {
  color: var(--w-text-muted);
  white-space: nowrap;
  font-size: 10px;
}

.log-level {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 3px;
  padding: 1px 4px;
  text-align: center;
  white-space: nowrap;
}
.log-level--info {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}
.log-level--debug {
  color: var(--w-text-muted);
  background: var(--w-bg-raised);
}
.log-level--http {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.log-level--warn {
  color: #d97706;
  background: rgba(217, 119, 6, 0.12);
}
.log-level--error {
  color: var(--w-text-err);
  background: rgba(220, 38, 38, 0.1);
}

.log-message {
  color: var(--w-text);
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
