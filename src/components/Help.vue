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
      options: {
        markdownIt: {
          html: true,
          breaks: true,
        },
      },
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
  methods: {},

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

.toc {
  padding-bottom: 56px;
  overflow: scroll;
  width: 400px;
}
.toc li a {
  color: white;
}

.markdown-it-vue-alter i {
  display: none;
}

.markdown-it-vue-alter {
  display: flex;
  flex-direction: row-reverse;
  position: fixed;
  left: -370px;
  top: 0;
  height: 100%;
  background: black;
  color: white;
  opacity: 0.9;
  transition: 0.3s;
}

.markdown-it-vue-alter:hover {
  left: 0;
}

.show-content {
  padding: 0 7px;
  text-align: center;
  writing-mode: sideways-lr;
}
</style>
