# Fitur 32 Besar + Braket Knockout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah babak 32 besar Piala Dunia 2026 — batasi pool undian arisan ke tim yang lolos + braket knockout display-only ala FIFA.

**Architecture:** File data baru `src/data/bracket.ts` (struktur editable, slot = team id atau placeholder TBD). Store dapat action `applyKnockout32()` yang set `includedTeamIds` ke 28 tim lolos + balik status ke `draft`. Tombol preset di `SetupForm.vue`. Komponen baru `BracketView.vue` display-only tampil di `Dashboard.vue`, highlight tim milik pemain.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Tailwind, Vitest. Tanpa @vue/test-utils (test = unit logic + `pnpm build` typecheck).

## Global Constraints

- Bahasa UI: Indonesia (ikuti copy existing, mis. "Negara peserta", "Undi Sekarang").
- Team id mengacu `src/data/teams.ts` (`TEAM_BY_ID`). Jangan tambah/ubah tim di `teams.ts`.
- Persist via `store.persist()` setiap ubah state pool (pola existing).
- Styling pakai util class existing (`panel`, `btn-primary`, `btn-ghost`, `field`, `eyebrow`, warna `turf`/`gold`/`chalk`/`pitch-line`).
- Test runner: `pnpm test` (vitest run). Typecheck+build: `pnpm build` (`vue-tsc --noEmit && vite build`).

---

### Task 1: Data braket + tipe

**Files:**
- Create: `src/data/bracket.ts`
- Test: `src/__tests__/bracket.test.ts`

**Interfaces:**
- Consumes: `TEAM_BY_ID` dari `src/data/teams.ts`.
- Produces:
  - `type Slot = { kind: 'team'; teamId: string } | { kind: 'tbd'; label: string }`
  - `interface BracketMatch { id: number; round: 'R32'|'R16'|'QF'|'SF'|'F'; home: Slot; away: Slot; date?: string; venue?: string }`
  - `export const QUALIFIED_32: string[]` (28 id konkret)
  - `export const BRACKET: BracketMatch[]`
  - helper `export function team(id: string): Slot` dan `export function tbd(label: string): Slot`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/bracket.test.ts
import { describe, it, expect } from 'vitest'
import { QUALIFIED_32, BRACKET } from '../data/bracket'
import { TEAM_BY_ID } from '../data/teams'

describe('QUALIFIED_32', () => {
  it('berisi 28 id (24 juara/runner-up + 4 peringkat-3 terkunci)', () => {
    expect(QUALIFIED_32).toHaveLength(28)
  })

  it('semua id unik', () => {
    expect(new Set(QUALIFIED_32).size).toBe(QUALIFIED_32.length)
  })

  it('semua id valid di TEAM_BY_ID', () => {
    for (const id of QUALIFIED_32) expect(TEAM_BY_ID[id]).toBeTruthy()
  })
})

describe('BRACKET', () => {
  it('punya 16 match R32', () => {
    expect(BRACKET.filter((m) => m.round === 'R32')).toHaveLength(16)
  })

  it('setiap slot kind=team mereferensi tim valid', () => {
    for (const m of BRACKET) {
      for (const s of [m.home, m.away]) {
        if (s.kind === 'team') expect(TEAM_BY_ID[s.teamId]).toBeTruthy()
      }
    }
  })

  it('id match unik', () => {
    const ids = BRACKET.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- bracket`
Expected: FAIL — "Cannot find module '../data/bracket'"

- [ ] **Step 3: Write minimal implementation**

```ts
// src/data/bracket.ts
export type Slot =
  | { kind: 'team'; teamId: string }
  | { kind: 'tbd'; label: string }

export interface BracketMatch {
  id: number
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'F'
  home: Slot
  away: Slot
  date?: string
  venue?: string
}

export const team = (teamId: string): Slot => ({ kind: 'team', teamId })
export const tbd = (label: string): Slot => ({ kind: 'tbd', label })

// 32 besar Piala Dunia 2026 (hasil grup resmi, sumber NBC Sports).
// 28 lolos pasti: 12 juara + 12 runner-up + 4 peringkat-3 berpoin 4.
// 4 slot peringkat-3 sisa (Korsel/Skotlandia/Iran/Aljazair/Kroasia — 4 lolos,
// 1 gugur via selisih gol) belum terkunci per 27 Juni → belum masuk pool drawable.
export const QUALIFIED_32: string[] = [
  // Juara grup A–L
  'MEX', 'SUI', 'BRA', 'USA', 'GER', 'NED', 'BEL', 'ESP', 'FRA', 'ARG', 'COL', 'ENG',
  // Runner-up grup A–L
  'RSA', 'CAN', 'MAR', 'AUS', 'CIV', 'JPN', 'EGY', 'CPV', 'NOR', 'AUT', 'POR', 'GHA',
  // Peringkat-3 terkunci (4 poin)
  'BIH', 'PAR', 'ECU', 'SWE',
]

const P3 = tbd('Peringkat-3')

export const BRACKET: BracketMatch[] = [
  // Round of 32
  { id: 1, round: 'R32', home: team('RSA'), away: team('CAN'), date: '28 Jun' },
  { id: 2, round: 'R32', home: team('GER'), away: team('PAR'), date: '29 Jun' },
  { id: 3, round: 'R32', home: team('BRA'), away: team('JPN'), date: '29 Jun' },
  { id: 4, round: 'R32', home: team('NED'), away: team('MAR'), date: '29 Jun' },
  { id: 5, round: 'R32', home: team('CIV'), away: team('NOR'), date: '30 Jun' },
  { id: 6, round: 'R32', home: team('FRA'), away: team('SWE'), date: '30 Jun' },
  { id: 7, round: 'R32', home: team('MEX'), away: P3, date: '30 Jun' },
  { id: 8, round: 'R32', home: team('ENG'), away: P3, date: '1 Jul' },
  { id: 9, round: 'R32', home: team('USA'), away: team('BIH'), date: '1 Jul' },
  { id: 10, round: 'R32', home: team('BEL'), away: P3, date: '1 Jul' },
  { id: 11, round: 'R32', home: team('ESP'), away: team('AUT'), date: '2 Jul' },
  { id: 12, round: 'R32', home: team('POR'), away: team('GHA'), date: '2 Jul' },
  { id: 13, round: 'R32', home: team('SUI'), away: P3, date: '2 Jul' },
  { id: 14, round: 'R32', home: team('AUS'), away: team('EGY'), date: '3 Jul' },
  { id: 15, round: 'R32', home: team('ARG'), away: team('CPV'), date: '3 Jul' },
  { id: 16, round: 'R32', home: team('COL'), away: P3, date: '3 Jul' },
  // Round of 16 (8) — display-only, terisi saat hasil masuk
  { id: 17, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 18, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 19, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 20, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 21, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 22, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 23, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 24, round: 'R16', home: tbd('Pemenang'), away: tbd('Pemenang') },
  // Perempat final (4)
  { id: 25, round: 'QF', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 26, round: 'QF', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 27, round: 'QF', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 28, round: 'QF', home: tbd('Pemenang'), away: tbd('Pemenang') },
  // Semifinal (2)
  { id: 29, round: 'SF', home: tbd('Pemenang'), away: tbd('Pemenang') },
  { id: 30, round: 'SF', home: tbd('Pemenang'), away: tbd('Pemenang') },
  // Final (1)
  { id: 31, round: 'F', home: tbd('Pemenang'), away: tbd('Pemenang') },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- bracket`
Expected: PASS (6 test)

- [ ] **Step 5: Commit**

```bash
git add src/data/bracket.ts src/__tests__/bracket.test.ts
git commit -m "feat: data braket 32 besar + tipe slot"
```

---

### Task 2: Store action `applyKnockout32`

**Files:**
- Modify: `src/stores/pool.ts` (import bracket; tambah action di blok `actions`)
- Test: `src/__tests__/knockout.test.ts`

**Interfaces:**
- Consumes: `QUALIFIED_32` dari `src/data/bracket.ts`.
- Produces: action `applyKnockout32(): void` — set `includedTeamIds = [...QUALIFIED_32]`, kosongkan hasil undian, balik `status` ke `'draft'`, **pertahankan** `playerNames`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/knockout.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePoolStore } from '../stores/pool'
import { QUALIFIED_32 } from '../data/bracket'

describe('applyKnockout32', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('set includedTeamIds ke 28 tim lolos', () => {
    const store = usePoolStore()
    store.applyKnockout32()
    expect(store.pool.includedTeamIds).toEqual(QUALIFIED_32)
    expect(store.effectiveTeams).toHaveLength(28)
  })

  it('pertahankan nama pemain tapi kosongkan hasil undian + balik draft', () => {
    const store = usePoolStore()
    store.setPlayerNames(['Budi', 'Sari'])
    store.runDraw()
    expect(store.pool.status).toBe('drawn')

    store.applyKnockout32()
    expect(store.pool.playerNames).toEqual(['Budi', 'Sari'])
    expect(store.pool.players).toHaveLength(0)
    expect(store.pool.status).toBe('draft')
    expect(store.pool.championTeamId).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- knockout`
Expected: FAIL — "store.applyKnockout32 is not a function"

- [ ] **Step 3: Write minimal implementation**

Di `src/stores/pool.ts`, tambah import di baris atas (gabung dengan import data existing):

```ts
import { QUALIFIED_32 } from '../data/bracket'
```

Lalu tambah action di dalam blok `actions` (mis. tepat sebelum `reset()`):

```ts
    applyKnockout32() {
      const { pool } = this
      pool.includedTeamIds = [...QUALIFIED_32]
      pool.players = []
      pool.drawnPlayerCount = 0
      pool.championTeamId = null
      pool.champion2TeamId = null
      pool.champion3TeamId = null
      pool.drawnAt = null
      pool.status = 'draft'
      this.persist()
    },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- knockout`
Expected: PASS (2 test)

- [ ] **Step 5: Commit**

```bash
git add src/stores/pool.ts src/__tests__/knockout.test.ts
git commit -m "feat: action applyKnockout32 batasi pool ke 32 besar"
```

---

### Task 3: Tombol preset "32 Besar" di SetupForm

**Files:**
- Modify: `src/components/SetupForm.vue` (panel "Negara peserta", sekitar baris 206–226)

**Interfaces:**
- Consumes: `store.applyKnockout32()` (Task 2).
- Produces: tombol UI; tak ada export baru.

- [ ] **Step 1: Tambah tombol preset di panel "Negara peserta"**

Di `src/components/SetupForm.vue`, di dalam `<div class="panel mt-6 p-5 sm:p-6">` (panel Negara peserta), tambahkan baris tombol tepat **sebelum** tombol toggle `showTeamPicker` (sebelum `<button ... @click="showTeamPicker = !showTeamPicker">`):

```html
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" class="btn-ghost" @click="store.applyKnockout32()">
          🏆 Pakai 32 Besar
        </button>
        <button
          v-if="store.pool.includedTeamIds !== null"
          type="button"
          class="btn-ghost"
          @click="store.setIncludedTeams(null)"
        >
          Semua 48 negara
        </button>
        <span class="text-xs text-chalk-dim">
          Batasi undian ke tim yang lolos babak gugur (undi ulang).
        </span>
      </div>
```

- [ ] **Step 2: Verifikasi typecheck + build**

Run: `pnpm build`
Expected: sukses tanpa error TypeScript.

- [ ] **Step 3: Verifikasi manual**

Run: `pnpm dev`, buka app. Di Setup, klik "🏆 Pakai 32 Besar" → label "Negara peserta" jadi "28 negara dipilih". Klik "Semua 48 negara" → balik "48".

- [ ] **Step 4: Commit**

```bash
git add src/components/SetupForm.vue
git commit -m "feat: tombol preset 32 besar di setup"
```

---

### Task 4: Komponen `BracketView.vue` + integrasi Dashboard

**Files:**
- Create: `src/lib/bracket.ts` (helper highlight — unit-testable)
- Create: `src/components/BracketView.vue`
- Modify: `src/components/Dashboard.vue` (render `<BracketView />` di bawah)
- Test: `src/__tests__/bracket-lib.test.ts`

**Interfaces:**
- Consumes: `BRACKET`, `Slot`, `TEAM_BY_ID`, `usePoolStore`.
- Produces:
  - `export function ownedTeamIds(players: { teamIds: string[] }[]): Set<string>`
  - Komponen `BracketView` (default export `.vue`), tanpa props (baca store langsung).

- [ ] **Step 1: Write the failing test untuk helper**

```ts
// src/__tests__/bracket-lib.test.ts
import { describe, it, expect } from 'vitest'
import { ownedTeamIds } from '../lib/bracket'

describe('ownedTeamIds', () => {
  it('kumpulkan semua teamId dari players', () => {
    const set = ownedTeamIds([
      { teamIds: ['BRA', 'GER'] },
      { teamIds: ['USA'] },
    ])
    expect(set).toEqual(new Set(['BRA', 'GER', 'USA']))
  })

  it('set kosong untuk players kosong', () => {
    expect(ownedTeamIds([])).toEqual(new Set())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- bracket-lib`
Expected: FAIL — "Cannot find module '../lib/bracket'"

- [ ] **Step 3: Implement helper**

```ts
// src/lib/bracket.ts
export function ownedTeamIds(players: { teamIds: string[] }[]): Set<string> {
  return new Set(players.flatMap((p) => p.teamIds))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- bracket-lib`
Expected: PASS (2 test)

- [ ] **Step 5: Buat komponen `BracketView.vue`**

```vue
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
```

- [ ] **Step 6: Integrasi ke Dashboard**

Baca `src/components/Dashboard.vue`. Di blok `<script setup>` tambah import:

```ts
import BracketView from './BracketView.vue'
```

Di `<template>`, tambahkan `<BracketView />` sebagai elemen terakhir di dalam root (setelah konten dashboard existing, sebelum penutup root).

- [ ] **Step 7: Verifikasi typecheck + build**

Run: `pnpm build`
Expected: sukses tanpa error TypeScript.

- [ ] **Step 8: Verifikasi manual**

Run: `pnpm dev`. Selesaikan satu undian (pakai 32 besar). Di Dashboard, braket tampil 5 kolom (32 Besar → Final), tim milik pemain tersorot hijau, slot peringkat-3 tampil ⏳.

- [ ] **Step 9: Commit**

```bash
git add src/lib/bracket.ts src/__tests__/bracket-lib.test.ts src/components/BracketView.vue src/components/Dashboard.vue
git commit -m "feat: komponen braket knockout display-only di dashboard"
```

---

## Self-Review

**Spec coverage:**
- Data file editable + QUALIFIED_32 + R32 pairing → Task 1. ✓
- Batasi pool ke 32 (reset & undi ulang) → Task 2 + Task 3. ✓
- BracketView display-only R32→Final + highlight tim pemain → Task 4. ✓
- Non-goals (interaktif, edit UI, skor) → tidak ada task. ✓
- Testing (QUALIFIED_32 integrity, slot valid, preset set includedTeamIds) → Task 1 + Task 2. ✓

**Placeholder scan:** TBD hanya di data domain (slot peringkat-3 / pemenang) — disengaja, bukan placeholder plan. Tak ada langkah tanpa kode konkret. ✓

**Type consistency:** `Slot`, `BracketMatch`, `QUALIFIED_32`, `applyKnockout32`, `ownedTeamIds` konsisten antar task. ✓

## Catatan finalisasi (pasca-plan)

Saat selisih gol resmi keluar (≥28 Jun), edit `src/data/bracket.ts`:
1. Tambah 4 id peringkat-3 lolos ke `QUALIFIED_32` (jadi 32) — update angka 28→32 di test Task 1.
2. Ganti `P3` di match R32 terkait dengan `team('XXX')` sesuai penempatan FIFA.
