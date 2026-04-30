<template>
  <div
    :class="[
      'documents',
      {
        'documents--fullscreen': fullscreen,
        'documents--leaving': fullscreenLeaving,
      },
    ]"
  >
    <div class="section-header">
      <h3>Study Protocol</h3>
      <button
        class="fullscreen-btn"
        @click="toggleFullscreen"
        :title="fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'"
      >
        <svg-icon
          :path="fullscreen ? mdiFullscreenExit : mdiFullscreen"
          :size="18"
        />
      </button>
    </div>
    <div class="doc-layout">
      <Transition name="toc-merge">
        <nav
          v-if="toc.length && tocVisible"
          class="section doc-toc"
          ref="tocRef"
        >
          <div class="toc-inner">
            <span class="toc-title">
              Contents
              <button
                class="toc-toggle-btn"
                @click="tocVisible = false"
                title="Hide table of contents"
              >
                <svg-icon :path="mdiChevronLeft" :size="16" />
              </button>
            </span>
            <ul>
              <li
                v-for="entry in toc"
                :key="entry.id"
                :class="[
                  'toc-item',
                  `toc-depth-${entry.depth}`,
                  { active: activeId === entry.id },
                ]"
              >
                <a :href="`#${entry.id}`" @click.prevent="scrollTo(entry.id)">
                  {{ entry.text }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </Transition>

      <div class="section doc-body" ref="bodyRef">
        <button
          v-if="toc.length && !tocVisible"
          class="toc-show-btn"
          @click="tocVisible = true"
          title="Show table of contents"
        >
          <svg-icon :path="mdiChevronRight" :size="16" />
          Contents
        </button>
        <div v-html="rendered" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useStore } from "vuex";
import { Marked } from "marked";
import raw from "../documents.md?raw";
import SvgIcon from "@/shared/ui/svgIcon";
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiFullscreen,
  mdiFullscreenExit,
} from "@mdi/js";

const store = useStore();

const bodyRef = ref<HTMLElement | null>(null);
const tocRef = ref<HTMLElement | null>(null);
const activeId = ref<string>("");
const tocVisible = ref(true);
const fullscreen = ref(false);
const fullscreenLeaving = ref(false);

function enterFullscreen() {
  fullscreen.value = true;
}

function exitFullscreen() {
  fullscreenLeaving.value = true;
  setTimeout(() => {
    fullscreen.value = false;
    fullscreenLeaving.value = false;
  }, 230);
}

function toggleFullscreen() {
  if (fullscreen.value) exitFullscreen();
  else enterFullscreen();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && fullscreen.value) exitFullscreen();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

const toc = computed<TocEntry[]>(() => {
  const tokens = new Marked().lexer(raw);
  const entries: TocEntry[] = [];
  for (const token of tokens) {
    if (token.type === "heading") {
      entries.push({
        id: slugify(token.text),
        text: token.text,
        depth: token.depth,
      });
    }
  }
  return entries;
});

const rendered = computed(() => {
  const instance = new Marked({
    renderer: {
      heading({ text, depth }) {
        const id = slugify(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
    },
  });
  return instance.parse(raw);
});

function scrollTo(id: string) {
  const el = bodyRef.value?.querySelector(`[id="${id}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

let observer: IntersectionObserver | null = null;

function setupObserver() {
  observer?.disconnect();

  const headings = bodyRef.value?.querySelectorAll("h1,h2,h3,h4,h5,h6");
  if (!headings?.length) return;

  const visible = new Set<string>();

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          visible.add(id);
        } else {
          visible.delete(id);
        }
      }
      if (visible.size) {
        const first = toc.value.find((t) => visible.has(t.id));
        if (first) activeId.value = first.id;
      }
    },
    { root: bodyRef.value, rootMargin: "0px 0px -60% 0px", threshold: 0 }
  );

  for (const h of headings) {
    observer.observe(h);
  }
}

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  await nextTick();
  setupObserver();
  if (toc.value.length) activeId.value = toc.value[0].id;
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("keydown", onKeydown);
});

watch(rendered, async () => {
  await nextTick();
  setupObserver();
});

watch(activeId, async (id) => {
  if (!id || !tocRef.value) return;
  await nextTick();
  const container = tocRef.value;
  const item = container.querySelector<HTMLElement>(".toc-item.active");
  if (!item) return;

  const titleEl = container.querySelector<HTMLElement>(".toc-title");
  const headerHeight = titleEl ? titleEl.getBoundingClientRect().height : 0;
  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  if (itemRect.top < containerRect.top + headerHeight) {
    container.scrollBy({
      top: itemRect.top - containerRect.top - headerHeight,
      behavior: "smooth",
    });
  } else if (itemRect.bottom > containerRect.bottom) {
    container.scrollBy({
      top: itemRect.bottom - containerRect.bottom,
      behavior: "smooth",
    });
  }
});

const layoutHeight = computed(() =>
  fullscreen.value ? "calc(100vh - 4.5rem)" : "calc(100vh - 16.4rem)"
);
</script>

<style scoped>
.documents {
  max-width: 1400px;
}

.documents--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1001;
  max-width: none;
  padding: 1.25rem 1.75rem;
  background: var(--color-bg-page);
  animation: fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.documents--fullscreen.documents--leaving {
  animation: fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes fs-enter {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fs-leave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle);
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;
}

.fullscreen-btn:hover {
  color: var(--color-toc-hover);
  background: var(--color-overlay-subtle);
}

.fullscreen-btn:focus-visible {
  outline: none;
}

.section {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.doc-layout {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  height: v-bind(layoutHeight);
}

.doc-toc {
  width: 220px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}

.toc-inner {
  width: 220px;
  padding: 0 1rem 1rem;
  box-sizing: border-box;
}

.doc-body {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  line-height: 1.7;
  color: var(--color-text-body);
  font-size: 0.9375rem;
  /* Spring restore when sibling transition class is removed */
  transition: border-top-left-radius 0.28s cubic-bezier(0.34, 1.4, 0.64, 1),
    border-bottom-left-radius 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
}

/*
 * Sibling-selector approach: while the TOC is mid-transition (either entering
 * or leaving), the body's left corners flatten in sync — no JS timers needed.
 * When the transition class is removed the body springs back via the rule above.
 */
.toc-merge-leave-active ~ .doc-body,
.toc-merge-enter-active ~ .doc-body {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  transition: border-top-left-radius 0.1s ease,
    border-bottom-left-radius 0.1s ease;
}

/* ---- TOC leave (hiding) ----------------------------------------- */
.toc-merge-leave-active,
.toc-merge-enter-active {
  overflow-y: hidden;
}

.toc-merge-leave-active {
  transition: width 0.38s cubic-bezier(0.4, 0, 0.85, 1) 0.12s,
    margin-right 0.18s ease, border-top-right-radius 0.16s ease,
    border-bottom-right-radius 0.16s ease;
}

.doc-toc.toc-merge-leave-to {
  width: 0;
  margin-right: -1rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* ---- TOC enter (showing) ---------------------------------------- */
.toc-merge-enter-active {
  transition: width 0.5s cubic-bezier(0.34, 1.25, 0.64, 1),
    margin-right 0.5s cubic-bezier(0.34, 1.25, 0.64, 1),
    border-top-right-radius 0.5s cubic-bezier(0.34, 1.25, 0.64, 1),
    border-bottom-right-radius 0.5s cubic-bezier(0.34, 1.25, 0.64, 1);
}

.doc-toc.toc-merge-enter-from {
  width: 0;
  margin-right: -1rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.toc-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: -0.375rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  padding: 0.75rem 0 0.5rem;
  background: var(--color-bg-surface);
}

.toc-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle);
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.15s ease, background 0.15s ease;
}

.toc-toggle-btn:hover {
  color: var(--color-toc-hover);
  background: var(--color-overlay-subtle);
}

.toc-show-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  transition: color 0.15s ease, background 0.15s ease;
}

.toc-show-btn:hover {
  color: var(--color-toc-hover);
  background: var(--color-overlay-subtle);
}

.doc-toc ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.toc-item a {
  display: block;
  font-size: 0.8125rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--color-text-subtle) !important;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.12s ease, background 0.12s ease;
}

.toc-item a:hover {
  color: var(--color-toc-hover) !important;
}

.toc-item.active a {
  color: var(--color-text-body) !important;
  background: var(--color-overlay-subtle);
  font-weight: 500;
}

.doc-toc::-webkit-scrollbar {
  width: 3px;
}

.doc-toc::-webkit-scrollbar-track {
  background: transparent;
  margin-top: 8px;
  margin-bottom: 8px;
}

.doc-toc::-webkit-scrollbar-thumb {
  background: var(--color-border);
}

.doc-toc::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-subtle);
}

.doc-body::-webkit-scrollbar {
  width: 4px;
}

.doc-body::-webkit-scrollbar-track {
  background: transparent;
  margin-top: 8px;
  margin-bottom: 8px;
}

.doc-body::-webkit-scrollbar-thumb {
  background: var(--color-border);
}

.doc-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-subtle);
}

.toc-depth-1 a {
  padding-left: 0.5rem;
}
.toc-depth-2 a {
  padding-left: 0.5rem;
}
.toc-depth-3 a {
  padding-left: 1.25rem;
  font-size: 0.75rem;
}
.toc-depth-4 a {
  padding-left: 2rem;
  font-size: 0.75rem;
}

.doc-body :deep(h1),
.doc-body :deep(h2),
.doc-body :deep(h3),
.doc-body :deep(h4),
.doc-body :deep(h5),
.doc-body :deep(h6) {
  font-weight: 700;
  color: var(--color-text);
  margin: 1.25em 0 0.5em;
  line-height: 1.3;
  scroll-margin-top: 1rem;
}

.doc-body :deep(h1) {
  font-size: 1.6rem;
}
.doc-body :deep(h2) {
  font-size: 1.3rem;
}
.doc-body :deep(h3) {
  font-size: 1.1rem;
}
.doc-body :deep(h4) {
  font-size: 1rem;
}

.doc-body :deep(p) {
  margin: 0.4em 0;
}

.doc-body :deep(ul),
.doc-body :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.4em 0;
}

.doc-body :deep(li) {
  margin: 0.2em 0;
}

.doc-body :deep(code) {
  font-family: monospace;
  font-size: 0.875em;
  background: var(--color-bg-code);
  padding: 1px 5px;
  border-radius: 3px;
}

.doc-body :deep(pre) {
  background: var(--color-bg-code);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0.75em 0;
}

.doc-body :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

.doc-body :deep(blockquote) {
  border-left: 3px solid var(--color-border-strong);
  margin: 0.75em 0;
  padding: 0.25rem 0 0.25rem 1rem;
  color: var(--color-text-subtle);
  font-style: italic;
}

.doc-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.25em 0;
}

.doc-body :deep(a) {
  color: var(--primary-500, #3b82f6);
  text-decoration: none;
}

.doc-body :deep(a:hover) {
  text-decoration: underline;
}

.doc-body :deep(strong) {
  font-weight: 700;
}

.doc-body :deep(em) {
  font-style: italic;
}

.doc-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75em 0;
  font-size: 0.875rem;
}

.doc-body :deep(th),
.doc-body :deep(td) {
  border: 1px solid var(--color-border);
  padding: 0.4rem 0.75rem;
  text-align: left;
}

.doc-body :deep(th) {
  font-weight: 600;
  background: var(--color-bg-code);
}
</style>
