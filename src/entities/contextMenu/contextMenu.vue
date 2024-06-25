<template>
  <div
    v-if="show"
    class="context-menu bg-white dark:bg-surface-700"
    :style="style"
    ref="context"
    tabindex="1"
    v-click-outside="onClickOutside"
  >
    <ul v-for="item in props.items" :key="item.title">
      <li @click="clickAction(item)">{{ item.title }}</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed, watch, ref, Ref, toRef } from "vue";

interface Item {
  title: string;
  action: (a, b) => void;
}
interface Props {
  items: Item[];
  location: object;
}

const props = defineProps<Props>();
const context = ref(null);

const location = toRef(props, "location");

function onClickOutside() {
  close();
}

const left: Ref<number> = ref(0);
const top: Ref<number> = ref(0);
const show: Ref<boolean> = ref(false);

const style = computed(() => {
  return {
    top: top.value + "px",
    left: left.value + "px",
  };
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
  const e = location.value.location.event;
  left.value = e.pageX || e.clientX;
  top.value = (e.pageY || e.clientY) - window.pageYOffset;
  show.value = true;
}

watch(location, () => {
  open();
});
</script>
<style lang="scss" scoped>
.context-menu {
  position: fixed;
  z-index: 999;
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
