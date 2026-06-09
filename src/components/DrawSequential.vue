<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { TEAM_BY_ID } from '../data/teams'

const store = usePoolStore()

const isShowingResult = ref(false)
const animating = ref(false)
const spinSlots = ref<string[]>([])
const spinKey = ref(0)

const allDone = computed(
  () => store.pool.drawnPlayerCount >= store.pool.playerNames.length,
)

const currentPlayerName = computed(
  () => store.playerDrawOrder[store.pool.drawnPlayerCount] ?? null,
)

const lastDrawnPlayer = computed(() => {
  const { players } = store.pool
  return players[players.length - 1] ?? null
})

const progress = computed(
  () => `${store.pool.drawnPlayerCount} / ${store.pool.playerNames.length}`,
)

function randomSlots(): string[] {
  const ids = store.effectiveTeams.map((t) => t.id)
  const shuffled = [...ids].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, store.pool.teamsPerPlayer)
}

function draw() {
  store.drawNextPlayer()
  animating.value = true
  spinSlots.value = randomSlots()
  spinKey.value++

  let delay = 70
  let remaining = 24

  function tick() {
    spinSlots.value = randomSlots()
    spinKey.value++
    remaining--
    if (remaining <= 0) {
      animating.value = false
      isShowingResult.value = true
    } else {
      if (remaining < 9) delay = Math.min(delay + 45, 500)
      setTimeout(tick, delay)
    }
  }
  setTimeout(tick, delay)
}

function next() {
  isShowingResult.value = false
}

function finish() {
  store.finalizeSequentialDraw()
}
</script>

<template>
  <section class="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">

    <!-- SPIN -->
    <template v-if="animating">
      <p class="eyebrow mb-4">Mengundi…</p>
      <p class="mb-6 font-display text-2xl uppercase tracking-wide text-chalk animate-shine">
        {{ lastDrawnPlayer?.name }}
      </p>
      <div class="mb-8 flex flex-wrap justify-center gap-3">
        <div
          v-for="(tid, i) in spinSlots"
          :key="`${spinKey}-${i}`"
          class="animate-flip rounded-xl border border-gold/60 bg-pitch-panel px-5 py-3 text-center shadow-glow"
        >
          <div class="text-4xl leading-none">{{ TEAM_BY_ID[tid]?.flag ?? '🌍' }}</div>
          <div class="mt-2 text-sm font-medium text-chalk">{{ TEAM_BY_ID[tid]?.name ?? '…' }}</div>
        </div>
      </div>
    </template>

    <!-- HASIL -->
    <template v-else-if="isShowingResult && lastDrawnPlayer">
      <p class="eyebrow mb-4">Hasil undian</p>
      <p class="mb-6 font-display text-2xl uppercase tracking-wide text-chalk">
        {{ lastDrawnPlayer.name }}
      </p>

      <div class="mb-8 flex flex-wrap justify-center gap-3">
        <div
          v-for="(tid, i) in lastDrawnPlayer.teamIds"
          :key="tid"
          class="animate-rise rounded-xl border border-pitch-line bg-pitch-panel px-5 py-3 text-center"
          :style="{ animationDelay: `${i * 120}ms` }"
        >
          <div class="text-4xl leading-none">{{ TEAM_BY_ID[tid].flag }}</div>
          <div class="mt-2 text-sm font-medium text-chalk">{{ TEAM_BY_ID[tid].name }}</div>
          <div class="mt-0.5 text-[0.6rem] uppercase tracking-widest text-chalk-dim">Grup {{ TEAM_BY_ID[tid].group }}</div>
        </div>
      </div>

      <template v-if="allDone">
        <p class="mb-5 text-sm text-chalk-dim">Semua pemain sudah dapat negara!</p>
        <button class="btn-primary px-8" @click="finish">Lihat Hasil Undian →</button>
      </template>
      <template v-else>
        <p class="mb-5 text-sm text-chalk-dim">
          Giliran berikutnya:
          <span class="font-semibold text-chalk">{{ currentPlayerName }}</span>
        </p>
        <button class="btn-primary" @click="next">Lanjut →</button>
      </template>
    </template>

    <!-- LAYAR UNDI -->
    <template v-else>
      <p class="eyebrow mb-2">Undian per pemain</p>
      <p class="mb-6 text-sm text-chalk-dim">{{ progress }}</p>

      <p class="mb-8 font-display text-3xl uppercase tracking-wide text-chalk">
        {{ currentPlayerName }}
      </p>

      <button class="btn-primary px-10 py-4 text-xl" @click="draw">
        🎲 Tarik Undian!
      </button>
    </template>

  </section>
</template>
