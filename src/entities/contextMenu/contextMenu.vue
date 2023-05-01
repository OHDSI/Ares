<template>
  <div
    v-if="show"
    class="context-menu"
    :style="style"
    ref="context"
    tabindex="1"
    v-on:blur="close"
  >
    <ul v-for="item in props.items" :key="item.title">
      <li @click="clickAction(item)">{{ item.title }}</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { nextTick, defineProps, computed, watch, ref, Ref } from "vue";
import { useStore } from "vuex";

interface Item {
  title: string;
  action: (a, b) => void;
}
interface Props {
  items: Item[];
}

const props = defineProps<Props>();
const context = ref(null);

const store = useStore();

const left: Ref<number> = ref(0);
const top: Ref<number> = ref(0);
const show: Ref<boolean> = ref(false);

const style = computed(() => {
  return {
    top: top.value + "px",
    left: left.value + "px",
  };
});

const coordinates = computed(() => {
  return store.getters.getContextMenuLocation;
});

function clickAction(item) {
  item.action();
  close();
}

function close() {
  show.value = false;
  left.value = 0;
  top.value = 0;
}
function open() {
  const e = store.getters.getContextMenuLocation.event;
  left.value = e.pageX || e.clientX;
  top.value = (e.pageY || e.clientY) - window.pageYOffset;
  show.value = true;
  nextTick(() => context.value.focus());
}

watch(coordinates, () => {
  open();
});
</script>
<style scoped>
.context-menu {
  position: fixed;
  z-index: 999;
  background: rgb(var(--v-theme-surface));
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
}
ul {
  list-style: none;
  width: 10vw;
}
li {
  padding: 10px;
  display: block;
}

li:hover {
  background: rgba(77, 144, 254, 0.1);
}
</style>
