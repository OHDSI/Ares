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
        <button
          class="panel-tab"
          :class="{ 'panel-tab--active': duckdbActiveTab === 'live' }"
          @click.stop="duckdbActiveTab = 'live'"
        >
          <span
            class="panel-title-dot"
            :class="duckdbLiveQueries.length ? 'dot-active' : 'dot-idle'"
          />
          Live
          <span v-if="duckdbLiveQueries.length" class="tab-count">
            {{ duckdbLiveQueries.length }}
          </span>
        </button>
        <button
          class="panel-tab"
          :class="{ 'panel-tab--active': duckdbActiveTab === 'history' }"
          @click.stop="duckdbActiveTab = 'history'"
        >
          History
          <span
            v-if="duckdbHistoryEntries.length"
            class="tab-count tab-count--dim"
          >
            {{ duckdbHistoryEntries.length }}
          </span>
        </button>
      </div>

      <div class="panel-header-actions">
        <template v-if="duckdbActiveTab === 'live'">
          <button
            class="panel-btn"
            :class="{ 'is-paused': duckdbPaused }"
            @click.stop="duckdbPaused = !duckdbPaused"
            title="Pause polling"
          >
            <i :class="duckdbPaused ? 'pi pi-play' : 'pi pi-pause'" />
          </button>
        </template>
        <button class="panel-btn" @click.stop="clearDuckdbPanel" title="Clear">
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

    <div v-if="duckdbActiveTab === 'live'" class="panel-body">
      <div v-if="!duckdbLiveQueries.length" class="panel-empty">
        <i class="pi pi-database panel-empty-icon" />
        <span>No active queries</span>
      </div>
      <div v-else class="query-list">
        <div v-for="(q, i) in duckdbLiveQueries" :key="i" class="query-item">
          <div class="query-meta">
            <span class="meta-time">{{ formatLogTime(q.startedAt) }}</span>
            <span class="duck-badge duck-badge--run">running</span>
          </div>
          <pre class="query-sql query-sql--pre duck-live-sql">{{
            formatSql(q.sql)
          }}</pre>
        </div>
      </div>
    </div>

    <div v-else-if="duckdbActiveTab === 'history'" class="panel-body">
      <div v-if="!duckdbHistoryEntries.length" class="panel-empty">
        <i class="pi pi-clock panel-empty-icon" />
        <span>No queries yet</span>
      </div>
      <div v-else class="query-list">
        <div
          v-for="(entry, i) in duckdbHistoryEntries"
          :key="i"
          class="query-item"
          :class="{ 'query-item--error': entry.error }"
        >
          <div class="query-meta">
            <span class="meta-time">{{ formatLogTime(entry.startedAt) }}</span>
            <span
              class="meta-duration"
              :class="durationClassMs(entry.durationMs)"
            >
              {{ formatDurationMs(entry.durationMs) }}
            </span>
            <span v-if="entry.error" class="meta-error-badge">error</span>
          </div>
          <div v-if="entry.error" class="query-error-msg">
            {{ entry.error }}
          </div>
          <pre class="query-sql query-sql--pre">{{ formatSql(entry.sql) }}</pre>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <template v-if="duckdbActiveTab === 'live'">
        <span class="footer-info">
          {{
            `polling every ${intervalSec}s${
              duckdbLastUpdated ? ` · updated ${duckdbLastUpdated}` : ""
            }${duckdbPaused ? " · paused" : ""}`
          }}
        </span>
      </template>
      <template v-else>
        <span class="footer-info">
          {{
            `${duckdbHistoryEntries.length} queries${
              duckdbLastUpdated ? ` · updated ${duckdbLastUpdated}` : ""
            }`
          }}
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, toRef, onMounted } from "vue";
import { useDuckdbTool } from "../composables/useDuckdbTool";
import {
  formatLogTime,
  formatDurationMs,
  durationClassMs,
  formatSql,
} from "@/shared/lib/formatters";

const props = defineProps({
  intervalSec: { type: Number, default: 2 },
});

defineEmits(["back", "close"]);

const startDrag = inject("startDrag");

const {
  duckdbLiveQueries,
  duckdbHistoryEntries,
  duckdbActiveTab,
  duckdbPaused,
  duckdbLastUpdated,
  start,
  clearDuckdbPanel,
} = useDuckdbTool(toRef(props, "intervalSec"));

onMounted(start);
</script>

<style scoped>
.tool-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.duck-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
  border-radius: 3px;
  padding: 1px 5px;
  white-space: nowrap;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}
:global(.dark .duck-badge) {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.12);
}

.duck-live-sql {
  max-height: 100px;
}
</style>
