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
    markdown
  },

  props: {},
  data() {
    return {
      contentLoaded: false,
      markdownContent: null,
      options: {
        markdownIt: {
          html: true,
          breaks: true
        }
      }
    };
  },
  created() {
    this.$store
      .dispatch(FETCH_FILES, {
        files: [{ name: HELP, required: true }]
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
    ...mapGetters(["getData", "getErrors"])
  }
};
</script>

<style></style>
