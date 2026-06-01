<template>
  <div class="flex flex-row items-center justify-between">
    <div>
      <p class="text-base font-medium leading-none">Sticky navigation bar</p>
      <p class="setting-desc">
        Keep the navigation bar fixed at the top while scrolling
      </p>
    </div>
    <InputSwitch v-model="stickyNavBar" />
  </div>
</template>

<script lang="ts">
export default {
  name: "ToggleBaseLine",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { TOGGLE_STICKY_NAV_BAR } from "@/widgets/settings/model/store/actions.type";
import InputSwitch from "primevue/inputswitch";

const store = useStore();

const stickyNavBar = computed({
  get: function (): boolean {
    return store.getters.getSettings.stickyNavBar;
  },
  set: function (value: boolean): void {
    store.dispatch(TOGGLE_STICKY_NAV_BAR, value);
  },
});
</script>

<style scoped>
.setting-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}
</style>
