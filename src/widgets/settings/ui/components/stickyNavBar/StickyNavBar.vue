<template>
  <div class="flex flex-row gap-5">
    <InputSwitch v-model="stickyNavBar" />
    <div>
      <h3>Sticky navigation bar</h3>
      <p class="font-thin">
        Keep the navigation bar fixed at the top while scrolling
      </p>
    </div>
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
import "@/widgets/settings/ui/components/stickyNavBar/StickyNavBar.vue";

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

<style scoped></style>
