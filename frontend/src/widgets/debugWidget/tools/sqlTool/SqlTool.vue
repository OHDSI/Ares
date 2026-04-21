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
          :class="{ 'panel-tab--active': activeTab === 'live' }"
          @click.stop="activeTab = 'live'"
        >
          <span
            class="panel-title-dot"
            :class="hasSql ? 'dot-active' : 'dot-idle'"
          />
          Live
          <span v-if="queries.length" class="tab-count">{{
            queries.length
          }}</span>
        </button>
        <button
          class="panel-tab"
          :class="{ 'panel-tab--active': activeTab === 'history' }"
          @click.stop="activeTab = 'history'"
        >
          History
          <span v-if="history.length" class="tab-count tab-count--dim">{{
            history.length
          }}</span>
        </button>
      </div>

      <div class="panel-header-actions">
        <template v-if="activeTab === 'live'">
          <button
            class="panel-btn"
            :class="{ 'is-paused': paused }"
            @click.stop="paused = !paused"
            title="Pause polling"
          >
            <i :class="paused ? 'pi pi-play' : 'pi pi-pause'" />
          </button>
        </template>
        <template v-else>
          <button
            class="panel-btn"
            @click.stop="fetchHistory"
            title="Refresh history"
          >
            <i class="pi pi-refresh" />
          </button>
          <button
            class="panel-btn"
            @click.stop="clearHistory"
            title="Clear history"
          >
            <i class="pi pi-trash" />
          </button>
        </template>
        <button
          class="panel-btn panel-btn--close"
          @click.stop="$emit('close')"
          title="Close"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'live'" class="panel-body">
      <div v-if="liveError" class="panel-error">{{ liveError }}</div>
      <div v-else-if="!queries.length" class="panel-empty">
        <i class="pi pi-info-circle panel-empty-icon" />
        <span>No active queries</span>
      </div>
      <div v-else class="query-list">
        <div
          v-for="q in queries"
          :key="q.pid"
          class="query-item"
          :class="{ 'query-item--waiting': q.waitEventType }"
        >
          <div class="query-meta">
            <span class="meta-pid">pid {{ q.pid }}</span>
            <span
              class="meta-duration"
              :class="durationClass(q.durationSeconds)"
            >
              {{ formatDurationSec(q.durationSeconds) }}
            </span>
            <span v-if="extractContext(q.query)" class="meta-context">
              {{ extractContext(q.query) }}
            </span>
            <span v-if="q.waitEventType" class="meta-wait">
              waiting: {{ q.waitEvent || q.waitEventType }}
            </span>
          </div>
          <Codemirror
            :model-value="formatSql(stripContext(q.query))"
            :extensions="sqlExtensions"
            :disabled="true"
            class="query-sql"
          />
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'history'" class="panel-body">
      <div v-if="historyError" class="panel-error">{{ historyError }}</div>
      <div v-else-if="historyLoading" class="panel-empty">
        <span>Loading…</span>
      </div>
      <div v-else-if="!history.length" class="panel-empty">
        <i class="pi pi-clock panel-empty-icon" />
        <span>No history yet</span>
      </div>
      <div v-else class="history-groups">
        <div
          v-for="group in groupedHistory"
          :key="group.context"
          class="history-group"
        >
          <button
            class="group-header"
            :class="{ 'group-header--unread': unreadGroups.has(group.context) }"
            @click.stop="toggleGroup(group.context)"
          >
            <i
              class="pi pi-chevron-down group-chevron"
              :class="{
                'group-chevron--open': !collapsedGroups.has(group.context),
              }"
            />
            <span class="group-label">{{ group.context }}</span>
            <span
              class="tab-count"
              :class="
                unreadGroups.has(group.context)
                  ? 'tab-count--unread'
                  : 'tab-count--dim'
              "
            >
              {{ group.entries.length }}
            </span>
            <span
              v-if="unreadGroups.has(group.context)"
              class="group-unread-dot"
            />
          </button>
          <div v-if="!collapsedGroups.has(group.context)" class="query-list">
            <div
              v-for="(q, i) in group.entries"
              :key="i"
              class="query-item"
              :class="{
                'query-item--error': q.error,
                'query-item--new': newEntryKeys.has(entryKey(q)),
              }"
            >
              <div class="query-meta">
                <span class="meta-time">{{ formatTime(q.startedAt) }}</span>
                <span
                  class="meta-duration"
                  :class="durationClassMs(q.durationMs)"
                >
                  {{ formatDurationMs(q.durationMs) }}
                </span>
                <span v-if="q.error" class="meta-error-badge">error</span>
              </div>
              <div v-if="q.error" class="query-error-msg">{{ q.error }}</div>
              <pre class="query-sql query-sql--pre">{{ formatSql(q.sql) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <template v-if="activeTab === 'live'">
        <span class="footer-info">
          {{
            `polling every ${intervalSec}s${
              lastUpdated ? ` · updated ${lastUpdated}` : ""
            }`
          }}
        </span>
        <button
          class="footer-slow-btn"
          :class="{ 'footer-slow-btn--running': slowRunning }"
          @click.stop="triggerSlow"
          :disabled="slowRunning"
        >
          {{
            slowRunning
              ? `pg_sleep running… (${slowSecs}s)`
              : "Run pg_sleep(30)"
          }}
        </button>
      </template>
      <template v-else>
        <span class="footer-info">
          {{
            `polling every ${intervalSec}s · ${
              history.length
            } queries (max 200)${
              lastHistoryFetch ? ` · updated ${lastHistoryFetch}` : ""
            }`
          }}
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, toRef, onMounted } from "vue";
import { Codemirror } from "vue-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { useSqlTool } from "../../composables/useSqlTool";
import {
  formatDurationSec,
  formatDurationMs,
  formatTime,
  durationClass,
  durationClassMs,
  extractContext,
  stripContext,
  formatSql,
} from "@/shared/lib/formatters";

const props = defineProps({
  intervalSec: { type: Number, default: 2 },
});

defineEmits(["back", "close"]);

const startDrag = inject("startDrag");
const sqlExtensions = [sql(), oneDark];

const {
  activeTab,
  queries,
  liveError,
  paused,
  lastUpdated,
  hasSql,
  history,
  historyError,
  historyLoading,
  lastHistoryFetch,
  collapsedGroups,
  unreadGroups,
  newEntryKeys,
  groupedHistory,
  slowSecs,
  slowRunning,
  entryKey,
  toggleGroup,
  fetchHistory,
  clearHistory,
  triggerSlow,
  start,
} = useSqlTool(toRef(props, "intervalSec"));

onMounted(start);
</script>

<style scoped>
.tool-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.query-sql :deep(.cm-editor) {
  border-radius: 0;
  max-height: 220px;
  overflow-y: auto;
}
.query-sql :deep(.cm-scroller) {
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 11px;
  line-height: 1.6;
  padding: 6px 10px;
}
.query-sql :deep(.cm-content) {
  padding: 0;
}
.query-sql :deep(.cm-focused) {
  outline: none;
}
.query-sql :deep(.cm-gutters) {
  display: none;
}
</style>
