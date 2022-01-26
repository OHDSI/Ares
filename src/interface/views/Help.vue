<template>
  <div v-if="!getErrors" id="help">
    <markdown
      v-if="contentLoaded"
      :content="markdownContent"
      :options="options"
    ></markdown>
  </div>
</template>
<script>
import markdown from "markdown-it-vue";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { HELP } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";

export default {
  name: "Help",
  components: {
    markdown,
  },

  props: {},
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
    this.$store
      .dispatch(FETCH_FILES, {
        files: [{ name: HELP, required: true }],
      })
      .then(() => {
        if (!this.getErrors) {
          this.markdownContent = this.getData[HELP];
          this.contentLoaded = true;
        }
      });
  },
  methods: {},
  computed: {
    ...mapGetters(["getData", "getErrors"]),
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
