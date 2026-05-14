<template>
  <button class="copy-btn" :class="{ copied }" @click="handleCopy">
    <i :class="['pi', copied ? 'pi-check' : 'pi-copy']" />
    {{ copied ? "Copied" : "Copy" }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { writeToClipboard } from "@/shared/lib/clipboard";

const props = defineProps<{
  text: string | null | undefined;
  forceCopied?: boolean;
}>();
const emit = defineEmits<{ copied: [] }>();

const _copied = ref(false);
const copied = computed(() => _copied.value || !!props.forceCopied);

async function handleCopy() {
  if (!props.text) return;
  await writeToClipboard(props.text, props.text);
  _copied.value = true;
  emit("copied");
  setTimeout(() => {
    _copied.value = false;
  }, 700);
}
</script>

<style scoped>
.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.625rem;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.12s ease, border-color 0.12s ease;
}

.copy-btn:hover {
  color: var(--color-interactive-hover);
  border-color: var(--color-interactive-hover);
}

.copy-btn.copied {
  color: #16a34a;
  border-color: rgba(22, 163, 74, 0.4);
}

.dark .copy-btn.copied {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.35);
}
</style>
