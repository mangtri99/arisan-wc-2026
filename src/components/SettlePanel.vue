<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { rupiah } from '../lib/format'
import { TEAM_BY_ID } from '../data/teams'

const store = usePoolStore()

// negara yang dipegang pemain (yang bisa jadi pemenang taruhan)
const assignedTeams = computed(() =>
  store.pool.players
    .flatMap((p) => p.teamIds)
    .map((id) => TEAM_BY_ID[id])
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
)

const open = ref(false)
</script>

<template>
  <div class="panel p-5 sm:p-6">
    <!-- Sudah ada juara -->
    <div v-if="store.pool.status === 'settled'" class="text-center">
      <p class="eyebrow mb-2">Hasil akhir</p>

      <template v-if="store.winner">
        <div class="mx-auto mb-3 text-5xl">{{ store.championTeam?.flag }}</div>
        <p class="text-sm text-chalk-dim">
          {{ store.championTeam?.name }} juara — pegangan
          <span class="font-semibold text-chalk">{{ store.winner.name }}</span>
        </p>
        <p class="mt-3 font-display text-4xl uppercase tracking-wide text-gold">
          {{ store.winner.name }} menang
        </p>
        <p class="tnum mt-1 text-lg text-chalk">{{ rupiah(store.pot) }}</p>
      </template>

      <template v-else>
        <div class="mx-auto mb-3 text-5xl">🏦</div>
        <p class="text-sm text-chalk-dim">
          {{ store.championTeam?.name }} juara, tapi negara itu masuk bank — tidak ada pemain yang pegang.
        </p>
        <p class="mt-3 font-display text-3xl uppercase tracking-wide text-chalk">Pot milik rumah</p>
        <p class="tnum mt-1 text-lg text-chalk-dim">{{ rupiah(store.pot) }}</p>
      </template>

      <button class="btn-ghost mt-5" @click="store.clearChampion()">Ganti juara</button>
    </div>

    <!-- Belum ditentukan -->
    <div v-else>
      <p class="eyebrow mb-1">Setelah final</p>
      <h2 class="mb-1 font-display text-xl uppercase tracking-wide">Siapa juaranya?</h2>
      <p class="mb-4 text-sm text-chalk-dim">
        Pilih negara yang jadi juara dunia. Pemegangnya mengambil seluruh pot
        <span class="tnum font-semibold text-chalk">{{ rupiah(store.pot) }}</span>.
      </p>

      <button class="btn-ghost w-full justify-between" @click="open = !open">
        <span>Pilih negara juara</span>
        <span>{{ open ? '▲' : '▼' }}</span>
      </button>

      <ul v-if="open" class="mt-3 grid max-h-72 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
        <li v-for="t in assignedTeams" :key="t.id">
          <button
            class="flex w-full items-center gap-2.5 rounded-lg border border-pitch-line px-3 py-2 text-left transition hover:border-gold hover:bg-gold/10"
            @click="store.setChampion(t.id); open = false"
          >
            <span class="text-xl">{{ t.flag }}</span>
            <span class="text-sm font-medium text-chalk">{{ t.name }}</span>
            <span class="ml-auto text-[0.65rem] uppercase tracking-widest text-chalk-dim">{{ t.group }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
