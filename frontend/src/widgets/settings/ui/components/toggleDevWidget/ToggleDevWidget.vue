<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="devWidget" />
    <div>
      <h3 class="text-lg leading-none">Dev Tools</h3>
      <p class="font-light">Show the developer tools widget</p>
    </div>
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
