<script setup lang="ts">
import { computed } from 'vue'
import { TEAM_BY_ID } from '../data/teams'
import type { Player } from '../types'

const props = defineProps<{
  player: Player
  index: number
  isWinner: boolean
  championIds: string[]
}>()

const teams = computed(() => props.player.teamIds.map((id) => TEAM_BY_ID[id]))
</script>

<template>
  <article
    class="relative animate-rise overflow-hidden rounded-2xl border bg-pitch-panel/70 p-5 transition"
    :class="isWinner ? 'border-gold shadow-glow' : 'border-pitch-line'"
    :style="{ animationDelay: `${index * 70}ms` }"
  >
    <!-- perforasi gaya tiket -->
    <div class="pointer-events-none absolute inset-y-0 left-12 w-px border-l border-dashed border-pitch-line/70"></div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span
          class="tnum flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold"
          :class="isWinner ? 'border-gold text-gold' : 'border-pitch-line text-chalk-dim'"
        >{{ index + 1 }}</span>
        <h3 class="font-display text-lg uppercase tracking-wide text-chalk">{{ player.name }}</h3>
      </div>
      <span v-if="isWinner" class="rounded-full bg-gold px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-pitch">
        🏆 Juara
      </span>
    </div>

    <ul class="mt-4 space-y-1.5">
      <li
        v-for="t in teams"
        :key="t.id"
        class="flex items-center gap-3 rounded-lg px-2 py-1.5"
        :class="championIds.includes(t.id) ? 'bg-gold/15' : ''"
      >
        <span class="text-2xl leading-none">{{ t.flag }}</span>
        <span class="font-medium text-chalk">{{ t.name }}</span>
        <span class="ml-auto text-xs uppercase tracking-widest text-chalk-dim">Grup {{ t.group }}</span>
      </li>
    </ul>
  </article>
</template>
