<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from './stores/pool'
import AppHeader from './components/AppHeader.vue'
import SetupForm from './components/SetupForm.vue'
import DrawReveal from './components/DrawReveal.vue'
import Dashboard from './components/Dashboard.vue'

const store = usePoolStore()

// fase lokal hanya untuk animasi reveal; sumber kebenaran tetap status di store
const revealing = ref(false)

const phase = computed<'setup' | 'reveal' | 'dashboard'>(() => {
  if (revealing.value) return 'reveal'
  return store.pool.status === 'draft' ? 'setup' : 'dashboard'
})

const stepLabel = computed(() =>
  ({ setup: 'Atur arisan', reveal: 'Mengundi', dashboard: 'Hasil undian' })[phase.value],
)

function onDraw() {
  revealing.value = true
}
function onRevealDone() {
  revealing.value = false
}
function onRedraw() {
  store.reset()
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppHeader :step="stepLabel" />

    <main>
      <SetupForm v-if="phase === 'setup'" @draw="onDraw" />
      <DrawReveal v-else-if="phase === 'reveal'" @done="onRevealDone" />
      <Dashboard v-else @redraw="onRedraw" />
    </main>

    <footer class="mx-auto mt-8 w-full max-w-5xl px-5 text-center text-xs text-chalk-dim">
      Buat seru-seruan bareng teman. Data 48 peserta sesuai hasil undian FIFA World Cup 2026.
    </footer>
  </div>
</template>
