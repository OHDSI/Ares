<template>
  <div id="help">
    <markdown
      v-if="contentLoaded"
      :content="markdownContent"
      :options="options"
    ></markdown>
  </div>
</template>
<script>
import markdown from "markdown-it-vue";
import axios from "axios";

export default {
  name: "Help",
  data() {
    return {
      contentLoaded: false,
      markdownContent: null,
      options: {},
    };
  },
  created() {
    var contentUrl = "doc/DefaultHelp.md";
    var vm = this;
    axios.get(contentUrl).then((response) => {
      vm.markdownContent = response.data;
      vm.contentLoaded = true;
    });
  },
  props: {},
  components: {
    markdown,
  },
};
</script>

<style>
.markdown-body h3 {
  margin-top: 15px;
}
.markdown-body h2 {
  margin-top: 10px;
}
</style>
