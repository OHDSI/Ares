<template>
  <TreeSelect
    unstyled
    style="width: 100%"
    v-model="selectedDefaultSources"
    :options="getSourceOptions"
    :meta-key-selection="false"
    selectionMode="checkbox"
    @node-select="onNodeSelect"
    placeholder="Default sources"
  />
  <p :class="countLeafSelections === 20 ? 'text-red-600' : ''">
    Selected sources: {{ countLeafSelections }}/20
  </p>
</template>

<script setup lang="ts">
import TreeSelect from "primevue/treeselect";
import { useStore } from "vuex";
import { computed, onBeforeMount, ref, watch } from "vue";
import { UPDATE_DEFAULT_SOURCES } from "@/widgets/settings/model/store/actions.type";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";

const store = useStore();

const countLeafSelections = computed(() => {
  return Object.keys(selectedDefaultSources.value).filter(
    (key) => key.split("-")[1]
  ).length;
});

const onNodeSelect = (node) => {
  if (node.children) {
    const overLimit = -20 + countLeafSelections.value;
    if (overLimit > 0) {
      store.dispatch(ADD_ALERT, {
        status: "",
        message: "Reached default sources limit",
      });
      const extraElements = node.children.slice(-overLimit);
      for (const extraElement in extraElements) {
        delete selectedDefaultSources.value[extraElements[extraElement].key];
      }
      if (overLimit === node.children.length) {
        delete selectedDefaultSources.value[node.key];
      } else {
        selectedDefaultSources.value[node.key].partialChecked = true;
      }
    }
  } else {
    if (countLeafSelections.value >= 21) {
      store.dispatch(ADD_ALERT, {
        status: "",
        message: "Reached default sources limit",
      });
      delete selectedDefaultSources.value[node.key];
    }
  }
};

const selectedDefaultSources = ref({});

const getParsedSelectedSources = computed(() => {
  const keys = Object.keys(selectedDefaultSources.value);
  return keys.reduce((acc, current) => {
    if (current.includes("-")) {
      const keyArray = current.split("-");
      const attribute = keyArray[0];
      const value = keyArray[1];
      return {
        ...acc,
        [getSourceOptions.value[attribute].data]: [
          ...(Array.isArray(acc[getSourceOptions.value[attribute].data])
            ? acc[getSourceOptions.value[attribute].data]
            : []),
          getSourceOptions.value[attribute].children[value].data,
        ],
      };
    } else {
      return { ...acc };
    }
  }, {});
});

onBeforeMount(() => {
  selectedDefaultSources.value = parseSourceToSelectedAttributes(
    store.getters.getSettings.defaultSources || {}
  );
});

function parseSourceToSelectedAttributes(parsedData) {
  const attributes = {};

  Object.keys(parsedData).forEach((sourceName) => {
    const sourceIndex = availableSources.value.findIndex(
      (source) => source.cdm_source_key === sourceName
    );

    // check if exists in available sources
    if (sourceIndex !== -1) {
      const parsedReleases = parsedData[sourceName];
      const availableReleases = availableSources.value[sourceIndex].releases;

      parsedReleases.forEach((releaseName) => {
        const releaseIndex = availableReleases.findIndex(
          (release) => release.release_id === releaseName
        );
        if (releaseIndex !== -1) {
          const key = `${sourceIndex}-${releaseIndex}`;
          attributes[key] = { partialChecked: false, checked: true };
        }
      });

      const allReleasesChecked = availableReleases.every((release) =>
        parsedReleases.includes(release.release_id)
      );

      attributes[sourceIndex] = {
        partialChecked: !allReleasesChecked,
        checked: allReleasesChecked,
      };
    }
  });
  return attributes;
}

const updateDefaultSources = function (updatedSources) {
  store.dispatch(UPDATE_DEFAULT_SOURCES, updatedSources);
};

watch(selectedDefaultSources, () => {
  updateDefaultSources(getParsedSelectedSources.value);
});

const availableSources = computed(() => {
  return store.getters.getSources;
});

const getSourceOptions = computed(() => {
  return availableSources.value.map((source, index) => {
    return {
      key: index,
      label: source.cdm_source_key,
      data: source.cdm_source_key,
      children: source.releases.map((value, valIndex) => {
        return {
          key: `${index}-${valIndex}`,
          label: value.release_name,
          data: value.release_id,
        };
      }),
    };
  });
});
</script>

<style scoped></style>
