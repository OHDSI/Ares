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
              <span style="color: white">{{ errors[0].userMessage }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="px-8 mb-5">
        <Accordion>
          <AccordionTab header="See error details">
            <p v-for="row in callStackRows" :key="row">{{ row }}</p>
          </AccordionTab>
        </Accordion>
      </div>

      <div class="flex justify-center bg-surface-800 rounded-b-md">
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
      <div class="flex flex-col gap-5 p-8">
        <div class="flex flex-row items-center gap-3">
          <svg-icon size="45" type="mdi" :path="mdiCloudAlert"></svg-icon>
          <div class="flex flex-col gap-2">
            <h3 class="text-xl">Something went wrong</h3>
            <ul class="flex flex-col gap-1">
              <li v-for="(error, index) in errors" :key="index">
                <span style="color: white">{{ error.userMessage }}</span>
              </li>
            </ul>
          </div>
        </div>
        <Accordion>
          <AccordionTab header="See technical details">
            <div v-if="errorDetails.technicalMessage.errorDetails[0].url">
              <div
                v-for="detail in errorDetails.technicalMessage.errorDetails"
                :key="detail.url"
              >
                <span>Path: </span><span>{{ detail.url }}</span
                >, <span>Error code: </span> <span>{{ detail.errorCode }}</span>
              </div>
            </div>
            <div v-if="errorDetails.technicalMessage.message">
              <span>Message: </span>
              <span>{{ errorDetails.technicalMessage.message }}</span>
            </div>
          </AccordionTab>
        </Accordion>
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
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";

const errors = computed(() => {
  return store.getters.getErrors;
});

function getStackTraceWithoutURL(stack) {
  return stack
    .replace(/https?:\/\/[^/]+/g, "")
    .split("\n", 3)
    .join("\n");
}

const isUnexpectedError = computed(() => {
  return errors.value[0].type === "unexpected";
});

const errorDetails = computed(() => {
  return errors.value[0];
});

const callStackRows = computed(() => {
  return errorDetails.value.stack.split("\n");
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
