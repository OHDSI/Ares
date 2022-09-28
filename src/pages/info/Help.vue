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
import { FETCH_FILES } from "@/processes/exploreReports/model/store/actions.type";
import { HELP } from "@/shared/config/files";
import { mapGetters } from "vuex";

export default {
  name: "Help",
  components: {
    markdown,
  },

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

<style></style>
