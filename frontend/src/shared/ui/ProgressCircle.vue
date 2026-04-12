<script setup lang="ts">
import AnimatedLogo from "@/shared/assets/AnimatedLogo.vue";
import BlackHoleLoading from "@/shared/assets/BlackHoleLoading.vue";
</script>

<template>
  <!--  <div-->
  <!--    class="inline-block h-40 w-40 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"-->
  <!--    role="status"-->
  <!--  ></div>-->
  <!--  <h3 class="text-lg dark:text-white">Loading...</h3>-->
  <!--  <AnimatedLogo />-->
  <BlackHoleLoading text="Loading..." size="lg" />
</template>

<style scoped></style>
