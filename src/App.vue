<script setup lang="ts">
import { computed, ref } from "vue";
import { usePoolStore } from "./stores/pool";
import AppHeader from "./components/AppHeader.vue";
import SetupForm from "./components/SetupForm.vue";
import DrawReveal from "./components/DrawReveal.vue";
import DrawSequential from "./components/DrawSequential.vue";
import Dashboard from "./components/Dashboard.vue";

const store = usePoolStore();

const revealing = ref(false);

const phase = computed<"setup" | "reveal" | "sequential" | "dashboard">(() => {
  if (revealing.value) return "reveal";
  const { status } = store.pool;
  if (status === "draft") return "setup";
  if (status === "drawing") return "sequential";
  return "dashboard";
});

const stepLabel = computed(
  () =>
    ({
      setup: "Atur arisan",
      reveal: "Mengundi",
      sequential: "Undian per pemain",
      dashboard: "Hasil undian",
    })[phase.value],
);

function onDraw() {
  revealing.value = true;
}
function onRevealDone() {
  revealing.value = false;
}
function onRedraw() {
  store.reset();
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader :step="stepLabel" />
    <main>
      <SetupForm v-if="phase === 'setup'" @draw="onDraw" />
      <DrawReveal v-else-if="phase === 'reveal'" @done="onRevealDone" />
      <DrawSequential v-else-if="phase === 'sequential'" />
      <Dashboard v-else @redraw="onRedraw" />
    </main>
    <footer
      class="mx-auto mt-8 w-full max-w-5xl px-5 text-center text-xs text-chalk-dim"
    >
      Made with 🔥 by
      <a
        href="https://instagram.com/mangtri78"
        target="_blank"
        class="hover:text-chalk-high underline"
        >Mang Tri</a
      >
      x
      <a
        href="https://claude.ai"
        target="_blank"
        class="hover:text-chalk-high underline"
        >Claude</a
      >
    </footer>
  </div>
</template>
