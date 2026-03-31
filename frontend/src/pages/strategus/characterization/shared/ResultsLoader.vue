<template>
  <Transition name="bh-fade">
    <div v-if="loaderState !== 'idle'" class="section">
      <BlackHoleLoading :state="loaderState" :text="text" />
    </div>
  </Transition>
</template>

<script setup>
import BlackHoleLoading from "@/shared/assets/BlackHoleLoading.vue";

defineProps({
  loaderState: {
    type: String,
    default: "idle",
    validator: (v) => ["idle", "loading", "success", "error"].includes(v),
  },
  text: {
    type: String,
    default: "Computing...",
  },
});
</script>

<style scoped>
@import "./styles.css";

.bh-fade-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.bh-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.bh-fade-leave-active {
  transition: opacity 0.22s ease;
}

.bh-fade-leave-to {
  opacity: 0;
}
</style>
