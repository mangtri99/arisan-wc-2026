<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { rupiah } from '../lib/format'
import { TEAM_BY_ID } from '../data/teams'

const store = usePoolStore()

const assignedTeams = computed(() =>
  store.pool.players
    .flatMap((p) => p.teamIds)
    .map((id) => TEAM_BY_ID[id])
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
)

const open = ref(false)
const openPicker = ref<1 | 2 | 3 | null>(null)

type ChampSlot = { place: 1 | 2 | 3; label: string; teamId: string | null }

const championSlots = computed<ChampSlot[]>(() => [
  { place: 1, label: '🥇 Juara 1', teamId: store.pool.championTeamId },
  { place: 2, label: '🥈 Juara 2', teamId: store.pool.champion2TeamId },
  { place: 3, label: '🥉 Juara 3', teamId: store.pool.champion3TeamId },
])

const allTieredSet = computed(() =>
  !!store.pool.championTeamId &&
  !!store.pool.champion2TeamId &&
  !!store.pool.champion3TeamId,
)

function takenByOthers(place: 1 | 2 | 3): Set<string> {
  const result = new Set<string>()
  if (place !== 1 && store.pool.championTeamId) result.add(store.pool.championTeamId)
  if (place !== 2 && store.pool.champion2TeamId) result.add(store.pool.champion2TeamId)
  if (place !== 3 && store.pool.champion3TeamId) result.add(store.pool.champion3TeamId)
  return result
}

function setForPlace(place: 1 | 2 | 3, teamId: string) {
  if (place === 1) {
    if (store.pool.prizeMode === 'tiered') {
      store.pool.championTeamId = teamId
      store.persist()
    } else {
      store.setChampion(teamId)
    }
  } else if (place === 2) {
    store.setChampion2(teamId)
  } else {
    store.setChampion3(teamId)
  }
  openPicker.value = null
}

function settleAll() {
  store.settlePool()
}
</script>

<template>
  <div class="panel p-5 sm:p-6">

    <!-- === WINNER-TAKES-ALL === -->
    <template v-if="store.pool.prizeMode === 'winner-takes-all'">

      <!-- Sudah settled -->
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
            {{ store.championTeam?.name }} juara, tapi negara itu masuk bank.
          </p>
          <p class="mt-3 font-display text-3xl uppercase tracking-wide text-chalk">Pot milik rumah</p>
          <p class="tnum mt-1 text-lg text-chalk-dim">{{ rupiah(store.pot) }}</p>
        </template>
        <button class="btn-ghost mt-5" @click="store.clearChampion()">Ganti juara</button>
      </div>

      <!-- Belum settled -->
      <div v-else>
        <p class="eyebrow mb-1">Setelah final</p>
        <h2 class="mb-1 font-display text-xl uppercase tracking-wide">Siapa juaranya?</h2>
        <p class="mb-4 text-sm text-chalk-dim">
          Pilih negara juara dunia. Pemegangnya mengambil seluruh pot
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

    </template>

    <!-- === TIERED 3 PEMENANG === -->
    <template v-else>

      <!-- Sudah settled -->
      <div v-if="store.pool.status === 'settled'">
        <p class="eyebrow mb-4">Hasil akhir</p>
        <div class="space-y-3">
          <div
            v-for="w in store.winners"
            :key="w.place"
            class="flex items-center gap-3 rounded-xl border border-pitch-line px-4 py-3"
          >
            <span class="text-2xl">{{ ['🥇','🥈','🥉'][w.place - 1] }}</span>
            <div class="flex-1">
              <p class="text-xs text-chalk-dim">Juara {{ w.place }}</p>
              <p class="font-semibold text-chalk">
                {{ w.player?.name ?? '🏦 Bank' }}
              </p>
              <p v-if="w.teamId" class="text-sm text-chalk-dim">
                {{ TEAM_BY_ID[w.teamId]?.flag }} {{ TEAM_BY_ID[w.teamId]?.name }}
              </p>
            </div>
            <p class="tnum text-right font-semibold text-gold">{{ rupiah(w.amount) }}</p>
          </div>
        </div>
        <button class="btn-ghost mt-5 w-full" @click="store.clearChampion()">Ganti juara</button>
      </div>

      <!-- Belum settled -->
      <div v-else>
        <p class="eyebrow mb-1">Setelah final</p>
        <h2 class="mb-4 font-display text-xl uppercase tracking-wide">Pilih juara 1, 2, 3</h2>

        <div class="space-y-3">
          <div v-for="slot in championSlots" :key="slot.place">
            <p class="field-label">{{ slot.label }}</p>
            <button
              class="btn-ghost w-full justify-between"
              @click="openPicker = openPicker === slot.place ? null : slot.place"
            >
              <span v-if="slot.teamId">
                {{ TEAM_BY_ID[slot.teamId]?.flag }} {{ TEAM_BY_ID[slot.teamId]?.name }}
              </span>
              <span v-else class="text-chalk-dim">Pilih negara…</span>
              <span>{{ openPicker === slot.place ? '▲' : '▼' }}</span>
            </button>
            <ul
              v-if="openPicker === slot.place"
              class="mt-1 grid max-h-48 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2"
            >
              <li
                v-for="t in assignedTeams.filter((t) => !takenByOthers(slot.place).has(t.id))"
                :key="t.id"
              >
                <button
                  class="flex w-full items-center gap-2.5 rounded-lg border border-pitch-line px-3 py-2 text-left transition hover:border-gold hover:bg-gold/10"
                  @click="setForPlace(slot.place, t.id)"
                >
                  <span class="text-xl">{{ t.flag }}</span>
                  <span class="text-sm font-medium text-chalk">{{ t.name }}</span>
                  <span class="ml-auto text-[0.65rem] uppercase tracking-widest text-chalk-dim">{{ t.group }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <button
          class="btn-primary mt-5 w-full"
          :disabled="!allTieredSet"
          @click="settleAll"
        >
          Simpan Hasil
        </button>
      </div>

    </template>

  </div>
</template>
