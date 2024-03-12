<template>
  <Message v-if="isUnexpectedError" unstyled :closable="false" severity="error">
    <template #container>
      <div class="flex flex-row items-center gap-3 p-8">
        <svg-icon
          v-if="isUnexpectedError"
          size="45"
          type="mdi"
          :path="mdiAlertCircleOutline"
        ></svg-icon>
        <div class="flex flex-col gap-2">
          <h3 class="text-xl">Something went wrong</h3>
          <div class="flex flex-col gap-5">
            <div>
              <span style="color: white">{{
                store.getters.getErrors[0].message
              }}</span>
              --
              <span style="color: white"
                >{ {{ store.getters.getErrors[0].details }} }</span
              >
            </div>

            <div>
              <h4 class="text-lg">Additional information:</h4>
              <p v-for="row in callStackRows" :key="row">{{ row }}</p>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="isUnexpectedError"
        class="flex justify-center bg-surface-800 rounded-b-md"
      >
        <Button
          size="block"
          class="self-center"
          @click="redirectToGithub"
          text
          plain
        >
          <div class="flex flex-row gap-2 items-center">
            <span>Submit the issue on</span>
            <span>
              <svg-icon size="40" type="mdi" :path="mdiGithub"></svg-icon
            ></span>
          </div>
        </Button>
      </div>
    </template>
  </Message>
  <Message v-else unstyled :closable="false" severity="error">
    <template #container>
      <div class="flex flex-row items-center gap-3 p-8">
        <svg-icon
          v-if="isUnexpectedError"
          size="45"
          type="mdi"
          :path="mdiAlertCircleOutline"
        ></svg-icon>
        <svg-icon v-else size="45" type="mdi" :path="mdiCloudAlert"></svg-icon>
        <div class="flex flex-col gap-2">
          <h3 class="text-xl">Something went wrong</h3>
          <ul class="flex flex-col gap-1">
            <li v-for="(error, index) in store.getters.getErrors" :key="index">
              <span style="color: white">{{ error.message }}</span> --
              <span style="color: white">{ {{ error.details }} }</span>
            </li>
          </ul>
        </div>
      </div>
      <div
        v-if="isUnexpectedError"
        class="flex justify-center bg-surface-800 rounded-b-md"
      >
        <Button
          size="block"
          class="self-center"
          @click="redirectToGithub"
          text
          plain
        >
          <div class="flex flex-row gap-2 items-center">
            <span>Submit the issue on</span>
            <span>
              <svg-icon size="40" type="mdi" :path="mdiGithub"></svg-icon
            ></span>
          </div>
        </Button>
      </div>
    </template>
  </Message>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import Message from "primevue/message";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiAlertCircleOutline, mdiCloudAlert, mdiGithub } from "@mdi/js";
import { links } from "@/shared/config/links";
import Button from "primevue/button";
import { computed } from "vue";

function getStackTraceWithoutURL(stack) {
  return stack
    .replace(/https?:\/\/[^/]+/g, "")
    .split("\n", 3)
    .join("\n");
}

const isUnexpectedError = computed(() => {
  return store.getters.getErrors[0].type === "unexpected";
});

const errorDetails = computed(() => {
  return store.getters.getErrors[0];
});

const callStackRows = computed(() => {
  return getStackTraceWithoutURL(errorDetails.value.stack).split("\n");
});

function redirectToGithub() {
  const titleText = `A ${errorDetails.value.name} on page ${errorDetails.value.page}`;
  const bodyText = `
    \n **To Reproduce**
    \n **Expected Behavior**
    \n **Screenshots**
    \n **Displayed error:** ${errorDetails.value.details}
    \n **Error details:**
    \n ${getStackTraceWithoutURL(errorDetails.value.stack)}
    \n **Browser:** ${navigator.userAgent}
    \n **Screen resolution:** ${window.screen.width} x ${window.screen.height}`;

  window
    .open(
      links.getNewIssueLink(titleText, encodeURIComponent(bodyText)),
      "_blank"
    )
    .focus();
}

const store = useStore();
</script>
<style scoped></style>
