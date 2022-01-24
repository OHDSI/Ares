<template>
  <div>
    <Explorer />
    <router-view name="ExplorerWrapper" />
  </div>
</template>

<script>
import Explorer from "../components/Explorer";

export default {
  name: "ExplorerWrapper",
  components: {
    Explorer,
  },
};
</script>

<style scoped></style>
