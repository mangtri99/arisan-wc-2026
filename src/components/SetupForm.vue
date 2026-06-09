<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { rupiah } from '../lib/format'
import type { DrawMode, PrizeMode, PrizeSplit } from '../types'
import TeamPicker from './TeamPicker.vue'

const store = usePoolStore()
const emit = defineEmits<{ (e: 'draw'): void }>()

const namesText = ref(store.pool.playerNames.join('\n'))
const showTeamPicker = ref(false)

const parsedNames = computed(() =>
  namesText.value
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean),
)

const effectiveCount = computed(() => store.effectiveTeams.length)
const teamsNeeded = computed(() => parsedNames.value.length * store.pool.teamsPerPlayer)
const overCapacity = computed(() => teamsNeeded.value > effectiveCount.value)
const bankCount = computed(() => Math.max(0, effectiveCount.value - teamsNeeded.value))
const potPreview = computed(() => parsedNames.value.length * store.pool.betAmount)
const splitTotal = computed(
  () => store.pool.prizeSplit.first + store.pool.prizeSplit.second + store.pool.prizeSplit.third,
)
const splitValid = computed(() => splitTotal.value === 100)

const canDraw = computed(
  () =>
    parsedNames.value.length >= 2 &&
    !overCapacity.value &&
    (store.pool.prizeMode === 'winner-takes-all' || splitValid.value),
)

function onDraw() {
  store.setPlayerNames(parsedNames.value)
  if (store.pool.drawMode === 'batch') {
    store.runDraw()
    emit('draw')
  } else {
    store.startSequentialDraw()
    // fase beralih otomatis via store.pool.status = 'drawing'
  }
}

function setDrawMode(mode: DrawMode) {
  store.pool.drawMode = mode
  store.persist()
}

function setPrizeMode(mode: PrizeMode) {
  store.pool.prizeMode = mode
  store.persist()
}

function updateSplit(key: keyof PrizeSplit, val: number) {
  store.pool.prizeSplit[key] = val
  store.persist()
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
          <span><span class="tnum font-semibold text-chalk">{{ teamsNeeded }}</span> / {{ effectiveCount }} negara terpakai</span>
          <span v-if="bankCount > 0">·</span>
          <span v-if="bankCount > 0"><span class="tnum font-semibold text-gold">{{ bankCount }}</span> negara ke bank</span>
        </div>

        <p v-if="overCapacity" class="mt-3 rounded-lg border border-whistle/40 bg-whistle/10 px-3 py-2 text-sm text-chalk">
          Kebanyakan. {{ parsedNames.length }} pemain × {{ store.pool.teamsPerPlayer }} negara butuh
          {{ teamsNeeded }} negara, padahal cuma ada {{ effectiveCount }}.
        </p>
      </div>

      <!-- Aturan -->
      <div class="panel flex flex-col gap-5 p-5 sm:p-6">
        <p class="eyebrow">Aturan main</p>

        <!-- Negara per orang -->
        <div>
          <label class="field-label">Negara per orang</label>
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
            >{{ n }}</button>
          </div>
        </div>

        <!-- Taruhan -->
        <div>
          <label class="field-label" for="bet">Taruhan per orang</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-chalk-dim">Rp</span>
            <input
              id="bet"
              v-model.number="store.pool.betAmount"
              type="number" min="0" step="5000"
              class="field tnum pl-9"
              @change="store.persist()"
            />
          </div>
          <p class="mt-1.5 text-xs text-chalk-dim">
            Total pot nanti: <span class="tnum font-semibold text-chalk">{{ rupiah(potPreview) }}</span>
          </p>
        </div>

        <!-- Seed -->
        <div>
          <label class="field-label" for="seed">Seed undian</label>
          <div class="flex gap-2">
            <input id="seed" v-model="store.pool.seed" class="field tnum tracking-widest" @change="store.persist()" />
            <button type="button" class="btn-ghost shrink-0" title="Acak ulang seed" @click="store.regenerateSeed()">↻</button>
          </div>
          <p class="mt-1.5 text-xs text-chalk-dim">Seed sama = hasil undian sama (provably fair).</p>
        </div>

        <!-- Mode undian -->
        <div>
          <label class="field-label">Mode undian</label>
          <div class="flex gap-2">
            <button
              v-for="m in [{ v: 'batch' as DrawMode, label: 'Sekaligus' }, { v: 'sequential' as DrawMode, label: 'Per pemain' }]"
              :key="m.v"
              type="button"
              class="flex-1 rounded-lg border py-2.5 text-sm transition"
              :class="store.pool.drawMode === m.v
                ? 'border-turf bg-turf/15 text-chalk'
                : 'border-pitch-line text-chalk-dim hover:border-chalk/30'"
              @click="setDrawMode(m.v)"
            >{{ m.label }}</button>
          </div>
          <p class="mt-1.5 text-xs text-chalk-dim">
            {{ store.pool.drawMode === 'batch'
              ? 'Semua dapat negara sekaligus.'
              : 'Tiap pemain undi sendiri secara bergiliran.' }}
          </p>
        </div>

        <!-- Mode hadiah -->
        <div>
          <label class="field-label">Sistem hadiah</label>
          <div class="flex gap-2">
            <button
              v-for="m in [{ v: 'winner-takes-all' as PrizeMode, label: 'Winner-takes-all' }, { v: 'tiered' as PrizeMode, label: '3 Pemenang' }]"
              :key="m.v"
              type="button"
              class="flex-1 rounded-lg border py-2 text-sm transition"
              :class="store.pool.prizeMode === m.v
                ? 'border-turf bg-turf/15 text-chalk'
                : 'border-pitch-line text-chalk-dim hover:border-chalk/30'"
              @click="setPrizeMode(m.v)"
            >{{ m.label }}</button>
          </div>

          <!-- Persentase tiered -->
          <div v-if="store.pool.prizeMode === 'tiered'" class="mt-3 grid grid-cols-3 gap-2">
            <div v-for="[key, label] in ([['first', '🥇 Juara 1'], ['second', '🥈 Juara 2'], ['third', '🥉 Juara 3']] as [keyof PrizeSplit, string][])" :key="key">
              <p class="mb-1 text-xs text-chalk-dim">{{ label }}</p>
              <div class="relative">
                <input
                  :value="store.pool.prizeSplit[key]"
                  type="number" min="0" max="100"
                  class="field tnum pr-6 text-center text-sm"
                  @input="updateSplit(key, +($event.target as HTMLInputElement).value)"
                />
                <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-chalk-dim">%</span>
              </div>
            </div>
            <p class="col-span-3 text-xs" :class="splitValid ? 'text-chalk-dim' : 'text-whistle'">
              Total: {{ splitTotal }}% {{ splitValid ? '' : '(harus 100%)' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pilihan negara -->
    <div class="panel mt-6 p-5 sm:p-6">
      <button
        type="button"
        class="flex w-full items-center justify-between"
        @click="showTeamPicker = !showTeamPicker"
      >
        <div class="text-left">
          <p class="eyebrow">Negara peserta</p>
          <p class="mt-0.5 text-sm text-chalk-dim">
            {{ store.pool.includedTeamIds === null ? '48' : store.pool.includedTeamIds.length }} negara dipilih
          </p>
        </div>
        <span class="text-chalk-dim">{{ showTeamPicker ? '▲' : '▼' }}</span>
      </button>
      <div v-if="showTeamPicker" class="mt-4">
        <TeamPicker
          :model-value="store.pool.includedTeamIds"
          @update:model-value="store.setIncludedTeams($event)"
        />
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-chalk-dim">
        <template v-if="store.pool.prizeMode === 'winner-takes-all'">
          Pot dibagi <span class="font-semibold text-chalk">winner-takes-all</span>.
        </template>
        <template v-else>
          Pot dibagi <span class="font-semibold text-chalk">juara 1/2/3</span>
          ({{ store.pool.prizeSplit.first }}% / {{ store.pool.prizeSplit.second }}% / {{ store.pool.prizeSplit.third }}%).
        </template>
      </p>
      <button class="btn-primary" :disabled="!canDraw" @click="onDraw">
        {{ store.pool.drawMode === 'batch' ? 'Undi Sekarang' : 'Mulai Undian Giliran' }}
      </button>
    </div>
  </section>
</template>
