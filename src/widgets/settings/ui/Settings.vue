<template>
  <v-row justify="center">
    <v-navigation-drawer v-model="showMenu" width="30%" fixed temporary right>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showMenu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Charts</v-subheader>
          <!--Features-->
          <ToggleBaseLine />
          <ToggleMinMax />
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
          <!--Features-->
          <ToggleDarkMode />
        </v-list>
      </v-card>
    </v-navigation-drawer>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import { settingsActions } from "@/widgets/settings";
import ToggleDarkMode from "@/features/toggleDarkMode/";
import ToggleBaseLine from "@/features/toggleBaseLine/";
import ToggleMinMax from "@/features/toggleMinMax/";

export default {
  name: "Settings",
  components: { ToggleMinMax, ToggleBaseLine, ToggleDarkMode },
  computed: {
    ...mapGetters(["getVisibility"]),
    showMenu: {
      get: function () {
        return this.getVisibility;
      },
      set: function (value) {
        this.$store.dispatch(settingsActions.CHANGE_UI_VISIBILITY, value);
      },
    },
  },
};
</script>

<style scoped></style>
