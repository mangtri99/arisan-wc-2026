<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { rupiah } from '../lib/format'
import { TOTAL_TEAMS } from '../data/teams'

const store = usePoolStore()
const emit = defineEmits<{ (e: 'draw'): void }>()

// textarea satu nama per baris
const namesText = ref(store.pool.playerNames.join('\n'))

const parsedNames = computed(() =>
  namesText.value
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean),
)

const teamsNeeded = computed(() => parsedNames.value.length * store.pool.teamsPerPlayer)
const overCapacity = computed(() => teamsNeeded.value > TOTAL_TEAMS)
const bankCount = computed(() => Math.max(0, TOTAL_TEAMS - teamsNeeded.value))
const potPreview = computed(() => parsedNames.value.length * store.pool.betAmount)

const canDraw = computed(() => parsedNames.value.length >= 2 && !overCapacity.value)

function onDraw() {
  store.setPlayerNames(parsedNames.value)
  store.runDraw()
  emit('draw')
}
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-5 py-8">
    <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <!-- Pemain -->
      <div class="panel p-5 sm:p-6">
        <p class="eyebrow mb-1">Daftar pemain</p>
        <h2 class="mb-4 font-display text-xl uppercase tracking-wide">Siapa saja yang ikut?</h2>

        <label class="field-label" for="names">Satu nama per baris</label>
        <textarea
          id="names"
          v-model="namesText"
          rows="8"
          class="field resize-y leading-relaxed"
          placeholder="Budi&#10;Sari&#10;Agus&#10;Mega"
        ></textarea>

        <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-chalk-dim">
          <span><span class="tnum font-semibold text-chalk">{{ parsedNames.length }}</span> pemain</span>
          <span>·</span>
          <span><span class="tnum font-semibold text-chalk">{{ teamsNeeded }}</span> / {{ TOTAL_TEAMS }} negara terpakai</span>
          <span v-if="bankCount > 0">·</span>
          <span v-if="bankCount > 0"><span class="tnum font-semibold text-gold">{{ bankCount }}</span> negara ke bank</span>
        </div>

        <p v-if="overCapacity" class="mt-3 rounded-lg border border-whistle/40 bg-whistle/10 px-3 py-2 text-sm text-chalk">
          Kebanyakan. {{ parsedNames.length }} pemain × {{ store.pool.teamsPerPlayer }} negara butuh
          {{ teamsNeeded }} negara, padahal cuma ada {{ TOTAL_TEAMS }}. Kurangi pemain atau jumlah negara per orang.
        </p>
      </div>

      <!-- Aturan -->
      <div class="panel flex flex-col gap-5 p-5 sm:p-6">
        <p class="eyebrow">Aturan main</p>

        <div>
          <label class="field-label" for="per">Negara per orang</label>
          <div class="flex gap-2">
            <button
              v-for="n in [1, 2, 3]"
              :key="n"
              type="button"
              class="flex-1 rounded-lg border py-2.5 font-display text-lg transition"
              :class="store.pool.teamsPerPlayer === n
                ? 'border-turf bg-turf/15 text-chalk'
                : 'border-pitch-line text-chalk-dim hover:border-chalk/30'"
              @click="store.pool.teamsPerPlayer = n; store.persist()"
            >
              {{ n }}
            </button>
          </div>
          <p class="mt-1.5 text-xs text-chalk-dim">Semua orang dapat jumlah yang sama.</p>
        </div>

        <div>
          <label class="field-label" for="bet">Taruhan per orang</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-chalk-dim">Rp</span>
            <input
              id="bet"
              v-model.number="store.pool.betAmount"
              type="number"
              min="0"
              step="5000"
              class="field tnum pl-9"
              @change="store.persist()"
            />
          </div>
          <p class="mt-1.5 text-xs text-chalk-dim">
            Total pot nanti: <span class="tnum font-semibold text-chalk">{{ rupiah(potPreview) }}</span>
          </p>
        </div>

        <div>
          <label class="field-label" for="seed">Seed undian</label>
          <div class="flex gap-2">
            <input id="seed" v-model="store.pool.seed" class="field tnum tracking-widest" @change="store.persist()" />
            <button type="button" class="btn-ghost shrink-0" title="Acak ulang seed" @click="store.regenerateSeed()">
              ↻
            </button>
          </div>
          <p class="mt-1.5 text-xs text-chalk-dim">
            Seed sama = hasil undian sama. Catat ini biar semua bisa cek undiannya jujur.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-chalk-dim">Pot dibagi <span class="font-semibold text-chalk">winner-takes-all</span> ke pemegang negara juara.</p>
      <button class="btn-primary" :disabled="!canDraw" @click="onDraw">
        Undi Sekarang
      </button>
    </div>
  </section>
</template>
