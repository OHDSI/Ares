<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-sm font-medium leading-none">Dev tools</p>
      <p class="text-xs opacity-60 mt-1">Show the developer tools widget</p>
    </div>
    <InputSwitch v-model="devWidget" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEV_WIDGET } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const devWidget = computed({
  get: (): boolean => store.getters.getSettings.devWidget,
  set: (value: boolean) => store.dispatch(TOGGLE_DEV_WIDGET, value),
});
</script>
