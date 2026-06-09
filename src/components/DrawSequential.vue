<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { TEAM_BY_ID } from '../data/teams'

const store = usePoolStore()

const isShowingResult = ref(false)

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

function draw() {
  store.drawNextPlayer()
  isShowingResult.value = true
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

    <!-- Hasil undian pemain terakhir -->
    <template v-if="isShowingResult && lastDrawnPlayer">
      <p class="eyebrow mb-4">Hasil undian</p>
      <p class="mb-6 font-display text-2xl uppercase tracking-wide text-chalk">
        {{ lastDrawnPlayer.name }}
      </p>

      <div class="mb-8 flex flex-wrap justify-center gap-3">
        <div
          v-for="tid in lastDrawnPlayer.teamIds"
          :key="tid"
          class="rounded-xl border border-pitch-line bg-pitch-panel px-5 py-3 text-center"
        >
          <div class="text-4xl leading-none">{{ TEAM_BY_ID[tid].flag }}</div>
          <div class="mt-2 text-sm font-medium text-chalk">{{ TEAM_BY_ID[tid].name }}</div>
          <div class="mt-0.5 text-[0.6rem] uppercase tracking-widest text-chalk-dim">Grup {{ TEAM_BY_ID[tid].group }}</div>
        </div>
      </div>

      <!-- Semua selesai -->
      <template v-if="allDone">
        <p class="mb-5 text-sm text-chalk-dim">Semua pemain sudah dapat negara!</p>
        <button class="btn-primary px-8" @click="finish">Lihat Hasil Undian →</button>
      </template>

      <!-- Masih ada pemain berikutnya -->
      <template v-else>
        <p class="mb-5 text-sm text-chalk-dim">
          Giliran berikutnya:
          <span class="font-semibold text-chalk">{{ currentPlayerName }}</span>
        </p>
        <button class="btn-primary" @click="next">Lanjut →</button>
      </template>
    </template>

    <!-- Layar undian (sebelum tekan tombol) -->
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
