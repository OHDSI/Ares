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

  <ConfirmDialog :group="props.chartId">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center p-5 bg-white rounded-lg">
        <span class="font-bold text-2xl block mb-2 mt-4">{{
          message.header
        }}</span>
        <p class="mb-0">{{ message.message }}</p>
        <div class="flex items-center gap-2 mt-4">
          <Button label="Yes" @click="acceptCallback" class="w-[8rem]"></Button>
          <Button
            label="Cancel"
            outlined
            @click="rejectCallback"
            class="w-[8rem]"
          ></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
<script setup lang="ts">
import { computed, watch, ref, Ref } from "vue";
import { useStore } from "vuex";
import Button from "primevue/button";

import ConfirmDialog from "primevue/confirmdialog";

import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();

const showTemplate = (item) => {
  confirm.require({
    group: props.chartId,
    header: "Confirmation",
    message: item.message,
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    rejectIcon: "pi pi-times",
    rejectClass: "p-button-sm",
    acceptClass: "p-button-outlined p-button-sm",
    accept: () => {
      item.action();
      return;
    },
    reject: () => {
      return;
    },
  });
};

interface Item {
  title: string;
  action: (a, b) => void;
}
interface Props {
  items: Item[];
  chartId: string;
}

const props = defineProps<Props>();
const context = ref(null);

const store = useStore();

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

const coordinates = computed(() => {
  return store.getters.getContextMenuLocation;
});

function clickAction(item) {
  if (item.useConfirm) {
    showTemplate(item);
    close();
  } else {
    item.action();
    close();
  }
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
}

watch(coordinates, () => {
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
