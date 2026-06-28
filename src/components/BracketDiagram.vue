<script setup lang="ts">
import { computed } from 'vue'
import { ROUNDS, THIRD_PLACE, type BracketMatch, type BracketSlot } from '../data/bracket'
import { TEAM_BY_ID } from '../data/teams'

// Kolom kiri (maju ke kanan) → final di tengah → kolom kanan (maju ke kiri).
const leftColumns = computed(() =>
  ROUNDS.filter((r) => r.key !== 'final').map((r) => ({
    key: r.key,
    label: r.label,
    matches: r.matches.filter((m) => m.side === 'left'),
  })),
)
const rightColumns = computed(() =>
  [...ROUNDS]
    .filter((r) => r.key !== 'final')
    .reverse()
    .map((r) => ({
      key: r.key,
      label: r.label,
      matches: r.matches.filter((m) => m.side === 'right'),
    })),
)
const finalMatch = computed(() => ROUNDS.find((r) => r.key === 'final')!.matches[0])

function slotTeam(slot: BracketSlot) {
  return slot.teamId ? TEAM_BY_ID[slot.teamId] ?? null : null
}
</script>

<template>
  <div class="overflow-x-auto pb-2">
    <div class="flex min-w-max items-stretch gap-3 px-1">
      <!-- Kolom kiri -->
      <div
        v-for="col in leftColumns"
        :key="'L-' + col.key"
        class="flex w-40 flex-col"
      >
        <p class="eyebrow mb-3 whitespace-nowrap text-[0.6rem]">{{ col.label }}</p>
        <div class="flex flex-1 flex-col justify-around gap-3">
          <div v-for="m in col.matches" :key="m.id" class="bracket-match" data-adv="right">
            <div class="match-meta">{{ m.id }} · {{ m.date }} · {{ m.time }}</div>
            <div class="match-card">
              <div
                v-for="(slot, i) in m.slots"
                :key="i"
                class="match-slot"
                :class="{ 'border-t border-pitch-line': i === 1 }"
              >
                <template v-if="slotTeam(slot)">
                  <span class="text-base leading-none">{{ slotTeam(slot)!.flag }}</span>
                  <span class="font-semibold tracking-wide">{{ slotTeam(slot)!.id }}</span>
                </template>
                <span v-else class="ref">{{ slot.ref }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final (tengah) -->
      <div class="flex w-44 flex-col items-center justify-center">
        <p class="mb-3 text-center font-display text-lg uppercase tracking-wider text-gold">
          Final
        </p>
        <div class="match-meta text-center">{{ finalMatch.date }} · {{ finalMatch.time }}</div>
        <div class="match-card w-full shadow-glow">
          <div
            v-for="(slot, i) in finalMatch.slots"
            :key="i"
            class="match-slot"
            :class="{ 'border-t border-pitch-line': i === 1 }"
          >
            <span class="ref text-gold">{{ slot.ref }}</span>
          </div>
        </div>

        <!-- Perebutan peringkat 3 -->
        <p class="mb-2 mt-6 text-center text-[0.6rem] uppercase tracking-widest text-chalk-dim">
          Play-off untuk peringkat ketiga
        </p>
        <div class="match-meta text-center">{{ THIRD_PLACE.date }} · {{ THIRD_PLACE.time }}</div>
        <div class="match-card w-full">
          <div
            v-for="(slot, i) in THIRD_PLACE.slots"
            :key="i"
            class="match-slot"
            :class="{ 'border-t border-pitch-line': i === 1 }"
          >
            <span class="ref">{{ slot.ref }}</span>
          </div>
        </div>
      </div>

      <!-- Kolom kanan -->
      <div
        v-for="col in rightColumns"
        :key="'R-' + col.key"
        class="flex w-40 flex-col"
      >
        <p class="eyebrow mb-3 whitespace-nowrap text-right text-[0.6rem]">{{ col.label }}</p>
        <div class="flex flex-1 flex-col justify-around gap-3">
          <div v-for="m in col.matches" :key="m.id" class="bracket-match" data-adv="left">
            <div class="match-meta text-right">{{ m.id }} · {{ m.date }} · {{ m.time }}</div>
            <div class="match-card">
              <div
                v-for="(slot, i) in m.slots"
                :key="i"
                class="match-slot"
                :class="{ 'border-t border-pitch-line': i === 1 }"
              >
                <template v-if="slotTeam(slot)">
                  <span class="text-base leading-none">{{ slotTeam(slot)!.flag }}</span>
                  <span class="font-semibold tracking-wide">{{ slotTeam(slot)!.id }}</span>
                </template>
                <span v-else class="ref">{{ slot.ref }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-meta {
  @apply mb-1 text-[0.6rem] tabular-nums text-chalk-dim;
}
.match-card {
  @apply overflow-hidden rounded-lg border border-pitch-line bg-pitch-panel;
}
.match-slot {
  @apply flex items-center gap-1.5 px-2 py-1.5 text-xs text-chalk;
}
.ref {
  @apply text-[0.7rem] font-semibold text-chalk-dim;
}
/* konektor horizontal kecil dari tiap match menuju ronde berikutnya */
.bracket-match {
  @apply relative;
}
.bracket-match[data-adv='right']::after,
.bracket-match[data-adv='left']::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 0.75rem;
  height: 1px;
  background: theme('colors.pitch.line');
}
.bracket-match[data-adv='right']::after {
  right: -0.75rem;
}
.bracket-match[data-adv='left']::before {
  left: -0.75rem;
}
</style>
