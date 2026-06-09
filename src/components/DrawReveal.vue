<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { TEAMS } from '../data/teams'

const emit = defineEmits<{ (e: 'done'): void }>()

const flag = ref('🏆')
const label = ref('Mengocok 48 negara…')
let timer: number | undefined
let stopAt = 0

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (prefersReduced) {
    emit('done')
    return
  }
  stopAt = performance.now() + 1700
  const tick = () => {
    const now = performance.now()
    if (now >= stopAt) {
      flag.value = '🏆'
      label.value = 'Undian selesai!'
      window.clearInterval(timer)
      window.setTimeout(() => emit('done'), 520)
      return
    }
    flag.value = TEAMS[Math.floor(Math.random() * TEAMS.length)].flag
  }
  // makin lama makin lambat (slot-machine feel) — pakai interval tetap yang cukup cepat
  timer = window.setInterval(tick, 70)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <section class="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-5 py-16">
    <p class="eyebrow mb-6">Undian berlangsung</p>
    <div
      class="flex h-44 w-44 items-center justify-center rounded-3xl border border-pitch-line bg-pitch-panel shadow-glow"
    >
      <span :key="flag" class="animate-flip text-7xl leading-none">{{ flag }}</span>
    </div>
    <p class="mt-8 font-display text-xl uppercase tracking-wide text-chalk">{{ label }}</p>
  </section>
</template>
