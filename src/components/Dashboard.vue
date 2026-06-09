<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { rupiah } from '../lib/format'
import { TEAM_BY_ID } from '../data/teams'
import { useDownloadImage } from '../lib/useDownloadImage'
import PlayerTicket from './PlayerTicket.vue'
import SettlePanel from './SettlePanel.vue'

const store = usePoolStore()
const emit = defineEmits<{ (e: 'redraw'): void }>()

const bankTeams = computed(() => store.bankTeamIds.map((id) => TEAM_BY_ID[id]))

const captureArea = ref<HTMLElement | null>(null)
const { downloading, downloadImage } = useDownloadImage()

function handleDownload() {
  if (captureArea.value) downloadImage(captureArea.value)
}
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-5 py-8">
    <!-- ringkasan pot -->
    <div class="panel mb-6 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div class="flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <p class="eyebrow">Total pot</p>
          <p class="tnum font-display text-3xl text-gold">{{ rupiah(store.pot) }}</p>
        </div>
        <div>
          <p class="eyebrow">Pemain</p>
          <p class="tnum font-display text-3xl text-chalk">{{ store.pool.players.length }}</p>
        </div>
        <div>
          <p class="eyebrow">Taruhan / orang</p>
          <p class="tnum font-display text-3xl text-chalk">{{ rupiah(store.pool.betAmount) }}</p>
        </div>
        <div>
          <p class="eyebrow">Seed</p>
          <p class="tnum font-display text-3xl tracking-wider text-chalk-dim">{{ store.pool.seed }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          class="btn-ghost"
          :disabled="downloading"
          @click="handleDownload"
        >
          <span v-if="downloading">⏳ Menyiapkan…</span>
          <span v-else>⬇️ Download Hasil</span>
        </button>
        <button class="btn-ghost" @click="emit('redraw')">Undi ulang</button>
      </div>
    </div>

    <div ref="captureArea" class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <!-- tiket pemain -->
      <div class="grid gap-4 sm:grid-cols-2">
        <PlayerTicket
          v-for="(p, i) in store.pool.players"
          :key="p.id"
          :player="p"
          :index="i"
          :champion-id="store.pool.championTeamId"
          :is-winner="store.winner?.id === p.id"
        />
      </div>

      <!-- panel juara + bank -->
      <div class="flex flex-col gap-6">
        <SettlePanel />

        <div v-if="bankTeams.length" class="panel p-5">
          <p class="eyebrow mb-3">🏦 Bank — {{ bankTeams.length }} negara tanpa pemilik</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="t in bankTeams"
              :key="t.id"
              class="flex items-center gap-1.5 rounded-full border border-pitch-line px-2.5 py-1 text-sm"
              :title="`Grup ${t.group}`"
            >
              <span>{{ t.flag }}</span>
              <span class="text-chalk-dim">{{ t.name }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
