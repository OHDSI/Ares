<template>
  <v-card>
    <div v-if="!getUserAccount">
      <v-container>
        <h3 class="text-center">Sign in with</h3>
      </v-container>
      <v-container class="button-container">
        <v-btn class="windows-login" @click="logIn">
          <v-icon>mdi-microsoft-windows</v-icon>
        </v-btn>
      </v-container>
    </div>
    <div v-else class="greeting">Hello, {{ getUserAccount }}</div>
  </v-card>
</template>

<script>
import { authActions } from "@/shared/api/authentication";
import { mapGetters } from "vuex";

export default {
  name: "AuthButton",
  methods: {
    logIn: function () {
      this.$store.dispatch(authActions.LOG_IN);
    },
  },
  computed: {
    ...mapGetters(["getToken", "getUserAccount"]),
  },
};
</script>

<style scoped>
.windows-login {
  width: 90%;
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.greeting {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}
</style>
