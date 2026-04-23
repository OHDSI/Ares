<template>
  <div class="home">
    <div class="home-content">
      <img
        :class="['home-logo', { inverted: !isDarkMode }]"
        :src="logo"
        height="80"
        width="80"
      />

      <div class="home-heading">
        <h1>ARES</h1>
        <p>
          Observational healthcare data: exploration, characterization, quality
          assessment.
        </p>
      </div>

      <div class="home-cards">
        <button class="nav-card" @click="redirectToHome">
          <div class="nav-card-body">
            <SvgIcon
              class="nav-card-icon"
              type="mdi"
              :path="mdiDatabaseSearch"
            />
            <div>
              <div class="nav-card-title">Data Sources</div>
              <div class="nav-card-desc">
                Browse data sources and OMOP reports
              </div>
            </div>
          </div>
          <SvgIcon class="nav-card-arrow" type="mdi" :path="mdiArrowRight" />
        </button>

        <button
          v-if="characterizationEnabled"
          class="nav-card"
          @click="redirectToStrategus"
        >
          <div class="nav-card-body">
            <SvgIcon class="nav-card-icon" type="mdi" :path="mdiFlask" />
            <div>
              <div class="nav-card-title">Characterization</div>
              <div class="nav-card-desc">
                Characterization and Cohorts reports
              </div>
            </div>
          </div>
          <SvgIcon class="nav-card-arrow" type="mdi" :path="mdiArrowRight" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import logo from "@/shared/assets/icon.png";
import environment from "@/shared/api/environment";
import { useRouter } from "vue-router";
import { mdiDatabaseSearch, mdiFlask, mdiArrowRight } from "@mdi/js";
import SvgIcon from "@/shared/ui/svgIcon";

const store = useStore();
const router = useRouter();

const isDarkMode = computed(() => store.getters.getSettings?.darkMode ?? false);
const characterizationEnabled = environment.CHARACTERIZATION;

function redirectToHome() {
  router.push("/network/overview");
}

function redirectToStrategus() {
  router.push("/characterization");
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  animation: home-appear 0.2s ease both;
}

@keyframes home-appear {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-logo {
  opacity: 0.9;
}

.home-logo.inverted {
  filter: invert(1);
}

.home-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.home-heading h1 {
  font-size: 2rem;
  font-weight: 200;
  letter-spacing: 0.35em;
  color: rgb(var(--surface-800));
}

.dark .home-heading h1 {
  color: white;
}

.home-heading p {
  font-size: 0.875rem;
  font-weight: 300;
  color: rgb(var(--surface-400));
  text-align: center;
}

.home-cards {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.nav-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 280px;
  padding: 1.25rem 1.25rem 1.25rem 1.5rem;
  border-radius: 10px;
  border: 1px solid rgb(var(--surface-100));
  background: rgb(var(--surface-0));
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dark .nav-card {
  background: rgb(var(--surface-800));
  border-color: rgb(var(--surface-700));
}

.nav-card:hover {
  border-color: rgb(var(--primary-400));
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
}

.nav-card:hover .nav-card-arrow {
  opacity: 1;
  transform: translateX(0);
}

.nav-card-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-card-icon {
  color: rgb(var(--primary-500));
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

.nav-card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(var(--surface-800));
  margin-bottom: 0.2rem;
}

.dark .nav-card-title {
  color: white;
}

.nav-card-desc {
  font-size: 0.75rem;
  font-weight: 300;
  color: rgb(var(--surface-400));
  line-height: 1.4;
}

.nav-card-arrow {
  color: rgb(var(--primary-400));
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
</style>
