<template>
  <v-form v-if="env.WEB_API_ENABLED === 'true'" ref="form">
    <v-card>
      <v-card-title>
        <span class="text-h5">Vocabulary search</span>
      </v-card-title>

      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-col>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    v-model="query"
                    label="Search concepts"
                    placeholder="Your query"
                    @keyup.enter="searchApi"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-autocomplete
                    v-model="vocabularySource"
                    :items="apiSources"
                    item-text="sourceKey"
                    item-value="sourceKey"
                    auto-select-first
                    label="Vocabulary source"
                  >
                  </v-autocomplete>
                </v-col>
                <v-col>
                  <v-btn
                    color="primary"
                    elevation="0"
                    rounded
                    class="search-btn"
                    @click="searchApi"
                    >Search</v-btn
                  >
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-data-table
                    :loading="getApiData.loading"
                    no-data-text="No concepts found"
                    item-key="CONCEPT_ID"
                    :items-per-page="5"
                    dense
                    :items="getApiData.data"
                    :headers="webapiHeaders"
                    loading-text="Loading concepts"
                  >
                    <template #item.actions="{ item }">
                      <v-icon
                        v-if="!addedConcepts[item.CONCEPT_ID]"
                        @click="save(item)"
                        >mdi-plus</v-icon
                      >
                      <v-icon
                        v-if="addedConcepts[item.CONCEPT_ID] === 'Not found'"
                        >mdi-close-octagon</v-icon
                      >
                      <v-icon v-if="addedConcepts[item.CONCEPT_ID] === 'Loaded'"
                        >mdi-check</v-icon
                      >
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
  <v-form v-else ref="form">
    <v-card>
      <v-card-title>
        <span class="text=h5">Add concepts</span>
      </v-card-title>
      <v-card-text>
        <v-container fluid>
          <v-row justify="space-between">
            <v-col>
              <v-text-field
                v-model.number="editedItem.CONCEPT_ID"
                :rules="[rules.required, rules.concept]"
                prepend-icon="mdi-chart-timeline-variant-shimmer"
                label="Concept ID"
                dense
                :success-messages="successMessage"
                :error-messages="errors"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-autocomplete
                v-model="editedItem.DOMAIN_ID"
                :rules="[rules.required]"
                label="Domain"
                prepend-icon="mdi-folder"
                dense
                :items="domains"
              >
              </v-autocomplete>
            </v-col>
            <v-col>
              <v-btn color="blue darken-1" text @click="save(editedItem)">
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { webApiActions } from "@/shared/api/webAPI";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import { mapGetters } from "vuex";
import environment from "@/shared/api/environment";

export default {
  name: "ConceptSearchForm",
  props: {
    addedConcepts: { type: Object, required: true, default: () => {} },
    successMessage: { type: Array, required: true, default: () => [] },
    errors: { type: String, required: true, default: "" },
  },
  data() {
    return {
      query: "",
      vocabularySource: "",
      editedItem: {
        CONCEPT_ID: "",
        DOMAIN_ID: "",
      },
      domains: [
        { text: "Condition occurrence", value: "Condition" },
        { text: "Drug Exposure", value: "Drug" },
        { text: "Device Exposure", value: "Device" },
        { text: "Measurement", value: "Measurement" },
        { text: "Procedure Occurrence", value: "Procedure" },
        { text: "Observation", value: "Observation" },
      ],
      defaultItem: {
        CONCEPT_ID: "",
        DOMAIN_ID: "",
      },
      rules: {
        required: (value) => !!value || "Required field",
        concept: (value) => {
          const pattern = /^\d+$/;
          return pattern.test(value) || "The field is digits only";
        },
      },
      apiSources: [],
      env: environment,
      webapiHeaders: [
        {
          text: "Concept ID",
          align: "start",
          sortable: true,
          value: "CONCEPT_ID",
        },
        {
          text: "Concept Name",
          align: "start",
          sortable: true,
          value: "CONCEPT_NAME",
        },
        {
          text: "Domain",
          align: "start",
          sortable: true,
          value: "DOMAIN_ID",
        },
        { text: "", value: "actions", sortable: false },
      ],
    };
  },
  created() {
    this.$store.dispatch(webApiActions.FETCH_WEBAPI_INFO).then(() => {
      this.apiSources = this.getApiData.apiSources.filter((source) =>
        source.daimons
          .reduce((array, current) => [...array, current.daimonType], [])
          .includes("Vocabulary")
      );
      this.vocabularySource = this.apiSources[0].sourceKey;
    });
  },
  computed: {
    ...mapGetters(["getApiData"]),
  },
  watch: {
    editedItem: {
      handler() {
        this.$emit("inputChanged");
      },
      deep: true,
    },
  },
  methods: {
    close() {
      this.$emit("close");
      if (this.$refs?.form) {
        this.$refs.form.resetValidation();
      }
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      });
      this.$store.dispatch(webApiActions.RESET_API_STORAGE);
    },
    save: function (item) {
      if (
        this.env.WEB_API_ENABLED === "false" &&
        this.editedItem.CONCEPT_ID === "" &&
        this.editedItem.domain === ""
      ) {
        return;
      }
      this.$emit("save", item);
    },
    searchApi: function () {
      if (!this.query.length) {
        return;
      }
      this.$store
        .dispatch(webApiActions.FETCH_VOCABULARY_SEARCH_RESULTS, {
          search: this.query,
          source: this.vocabularySource,
        })
        .then(() => {
          if (this.getApiData?.error?.name === "AxiosError") {
            this.$store.dispatch(ADD_ALERT, {
              message: "WebAPI server replied with status code",
              status: this.getApiData.error.response.status,
            });
          }
        });
    },
  },
};
</script>

<style scoped></style>
