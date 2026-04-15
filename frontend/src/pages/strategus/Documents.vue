<template>
  <div class="documents">
    <div class="section-header">
      <h3>Study Protocol</h3>
    </div>
    <div class="doc-layout">
      <nav v-if="toc.length" class="section doc-toc" ref="tocRef">
        <span class="toc-title">Contents</span>
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
      </nav>
      <div class="section doc-body" ref="bodyRef" v-html="rendered" />
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
import raw from "./documents.md?raw";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const bodyRef = ref<HTMLElement | null>(null);
const tocRef = ref<HTMLElement | null>(null);
const activeId = ref<string>("");

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
  await nextTick();
  setupObserver();
  if (toc.value.length) activeId.value = toc.value[0].id;
});

onBeforeUnmount(() => {
  observer?.disconnect();
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

const stickyNav = computed(() => store.getters.getSettings.stickyNavBar);
const layoutHeight = computed(() =>
  stickyNav.value ? "calc(100vh - 15rem)" : "calc(100vh - 10rem)"
);

const sectionBg = computed(() => (darkMode.value ? "#212121" : "#ffffff"));
const sectionBorder = computed(() => (darkMode.value ? "#3a3a3a" : "#94a3b8"));
const headerColor = computed(() => (darkMode.value ? "#f1f5f9" : "#1e293b"));
const mutedColor = computed(() => (darkMode.value ? "#9ca3af" : "#94a3b8"));
const codeBlockBg = computed(() => (darkMode.value ? "#0f172a" : "#f1f5f9"));
const blockquoteBorder = computed(() =>
  darkMode.value ? "#475569" : "#cbd5e1"
);
const bodyText = computed(() => (darkMode.value ? "#e2e8f0" : "#1e293b"));
const tocActiveBg = computed(() =>
  darkMode.value ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"
);
const tocActiveColor = computed(() =>
  darkMode.value ? "#e2e8f0" : "#334155"
);
const tocInactiveColor = computed(() =>
  darkMode.value ? "#64748b" : "#94a3b8"
);
const tocHoverColor = computed(() =>
  darkMode.value ? "#cbd5e1" : "#475569"
);
</script>

<style scoped>
.documents {
  max-width: 1400px;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-weight: 700;
  margin: 0;
  color: v-bind(headerColor);
}

.section {
  background: v-bind(sectionBg);
  border: 1.5px solid v-bind(sectionBorder);
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
}

.toc-title {
  display: block;
  position: sticky;
  top: -1rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: v-bind(mutedColor);
  padding: 1rem 0 0.5rem;
  background: v-bind(sectionBg);
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
  color: v-bind(tocInactiveColor) !important;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.12s ease, background 0.12s ease;
}

.toc-item a:hover {
  color: v-bind(tocHoverColor) !important;
}

.toc-item.active a {
  color: v-bind(tocActiveColor) !important;
  background: v-bind(tocActiveBg);
  font-weight: 500;
}

.doc-toc::-webkit-scrollbar {
  width: 3px;
}

.doc-toc::-webkit-scrollbar-track {
  background: transparent;
}

.doc-toc::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background: v-bind(sectionBorder);
}

.doc-toc::-webkit-scrollbar-thumb:hover {
  background: v-bind(mutedColor);
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

.doc-body {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  line-height: 1.7;
  color: v-bind(bodyText);
  font-size: 0.9375rem;
}

.doc-body :deep(h1),
.doc-body :deep(h2),
.doc-body :deep(h3),
.doc-body :deep(h4),
.doc-body :deep(h5),
.doc-body :deep(h6) {
  font-weight: 700;
  color: v-bind(headerColor);
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
  background: v-bind(codeBlockBg);
  padding: 1px 5px;
  border-radius: 3px;
}

.doc-body :deep(pre) {
  background: v-bind(codeBlockBg);
  border: 1px solid v-bind(sectionBorder);
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
  border-left: 3px solid v-bind(blockquoteBorder);
  margin: 0.75em 0;
  padding: 0.25rem 0 0.25rem 1rem;
  color: v-bind(mutedColor);
  font-style: italic;
}

.doc-body :deep(hr) {
  border: none;
  border-top: 1px solid v-bind(sectionBorder);
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
  border: 1px solid v-bind(sectionBorder);
  padding: 0.4rem 0.75rem;
  text-align: left;
}

.doc-body :deep(th) {
  font-weight: 600;
  background: v-bind(codeBlockBg);
}
</style>
