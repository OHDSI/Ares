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
        <Auth />
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
          <!--Features-->
          <ToggleDarkMode />
        </v-list>
        <v-list three-line subheader>
          <v-subheader>Charts</v-subheader>
          <!--Features-->
          <ToggleBaseLine />
          <ToggleMinMax />
        </v-list>
        <v-divider></v-divider>
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
import Auth from "@/features/userAuth/Auth";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Settings",
  components: { Auth, ToggleMinMax, ToggleBaseLine, ToggleDarkMode },
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
