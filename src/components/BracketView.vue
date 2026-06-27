<!-- src/components/BracketView.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { usePoolStore } from '../stores/pool'
import { BRACKET, type BracketMatch, type Slot } from '../data/bracket'
import { TEAM_BY_ID } from '../data/teams'
import { ownedTeamIds } from '../lib/bracket'

const store = usePoolStore()
const owned = computed(() => ownedTeamIds(store.pool.players))

const ROUNDS: { key: BracketMatch['round']; label: string }[] = [
  { key: 'R32', label: '32 Besar' },
  { key: 'R16', label: '16 Besar' },
  { key: 'QF', label: 'Perempat Final' },
  { key: 'SF', label: 'Semifinal' },
  { key: 'F', label: 'Final' },
]

function matchesOf(round: BracketMatch['round']) {
  return BRACKET.filter((m) => m.round === round)
}
function name(s: Slot) {
  return s.kind === 'team' ? TEAM_BY_ID[s.teamId]?.name ?? s.teamId : s.label
}
function flag(s: Slot) {
  return s.kind === 'team' ? TEAM_BY_ID[s.teamId]?.flag ?? '' : '⏳'
}
function isOwned(s: Slot) {
  return s.kind === 'team' && owned.value.has(s.teamId)
}
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-5 py-8">
    <p class="eyebrow mb-1">Babak gugur</p>
    <h2 class="mb-4 font-display text-xl uppercase tracking-wide">Braket Piala Dunia 2026</h2>

    <div class="flex gap-4 overflow-x-auto pb-3">
      <div v-for="r in ROUNDS" :key="r.key" class="min-w-[15rem] shrink-0">
        <p class="eyebrow mb-2">{{ r.label }}</p>
        <div class="flex flex-col gap-2">
          <div v-for="m in matchesOf(r.key)" :key="m.id" class="panel p-2.5">
            <div
              v-for="(s, i) in [m.home, m.away]"
              :key="i"
              class="flex items-center gap-2 rounded px-1.5 py-1 text-sm"
              :class="isOwned(s) ? 'bg-turf/20 font-semibold text-chalk' : 'text-chalk-dim'"
            >
              <span class="w-5 text-center">{{ flag(s) }}</span>
              <span class="truncate">{{ name(s) }}</span>
            </div>
            <p v-if="m.date" class="mt-1 px-1.5 text-[0.65rem] text-chalk-dim">{{ m.date }}</p>
          </div>
        </div>
      </div>
    </div>
    <p class="mt-3 text-xs text-chalk-dim">
      Tim bersorot <span class="rounded bg-turf/20 px-1 font-semibold text-chalk">hijau</span> = dimiliki pemain.
      Slot ⏳ menunggu hasil.
    </p>
  </section>
</template>
