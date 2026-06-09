# Arisan Piala Dunia 2026 — V2 Design Spec

**Date:** 2026-06-09  
**Status:** Approved  

---

## Overview

V2 menambahkan tiga fitur utama ke aplikasi arisan berbasis Vue + Pinia + localStorage:

1. **Undian per pemain (sequential draw)** — tiap pemain undi sendiri secara bergiliran di satu device
2. **Sistem hadiah tiered** — pilihan antara winner-takes-all atau juara 1/2/3 dengan persentase yang bisa dikonfigurasi
3. **Pilihan negara** — host bisa memilih negara mana saja dari 48 yang diikutsertakan dalam undian

Tidak ada backend. Semua state di localStorage. Backward compatible dengan pool yang tersimpan.

---

## 1. Data Model

### Tambahan di `types.ts`

```typescript
export type DrawMode = 'batch' | 'sequential'
export type PrizeMode = 'winner-takes-all' | 'tiered'

export interface PrizeSplit {
  first: number   // persentase integer, e.g. 50
  second: number  // e.g. 30
  third: number   // e.g. 20
  // harus sum ke 100; UI normalize otomatis
}

// PoolStatus tambah nilai baru
export type PoolStatus = 'draft' | 'drawing' | 'drawn' | 'settled'
//                                  ^^^^^^^^ baru: sequential in-progress

// Pool tambah field:
export interface Pool {
  // ... (semua field existing tetap)

  // v2 additions
  includedTeamIds: string[] | null  // null = semua 48
  drawMode: DrawMode
  prizeMode: PrizeMode
  prizeSplit: PrizeSplit
  drawnPlayerCount: number          // sequential: index pemain berikutnya
  champion2TeamId: string | null    // juara 2 (tiered mode)
  champion3TeamId: string | null    // juara 3 (tiered mode)
}
```

### Default di `blankPool()`

```typescript
includedTeamIds: null,
drawMode: 'batch',
prizeMode: 'winner-takes-all',
prizeSplit: { first: 50, second: 30, third: 20 },
drawnPlayerCount: 0,
champion2TeamId: null,
champion3TeamId: null,
```

**Backward compatibility:** `load()` sudah pakai `{ ...blankPool(), ...JSON.parse(raw) }` sehingga pool lama mendapat default semua field baru secara otomatis.

---

## 2. Draw System

### Prinsip Provably Fair (dipertahankan)

Seed men-shuffle dua hal:
1. **Urutan negara** (sama seperti v1)
2. **Urutan pemain** (baru di sequential mode)

Seed yang sama → urutan pemain + pembagian negara identik → bisa diverifikasi siapa dapat siapa.

### Tambahan di `draw.ts`

```typescript
// Kembalikan array playerNames dalam urutan acak berdasarkan seed
export function shufflePlayerOrder(names: string[], seed: string): string[]

// Hitung teams untuk satu pemain pada playerIndex tertentu
// (dari pool negara yang sudah di-shuffle oleh seed)
export function drawForPlayer(
  teams: Team[],
  playerOrder: string[],   // hasil shufflePlayerOrder
  teamsPerPlayer: number,
  seed: string,
  playerIndex: number,     // 0-based
): Player
```

### Flow Sequential di Store

1. `startSequentialDraw()`:
   - Hitung `playerOrder = shufflePlayerOrder(playerNames, seed)`
   - Status → `'drawing'`
   - `drawnPlayerCount = 0`
   - `players = []`

2. `drawNextPlayer()`:
   - Re-derive `playerOrder = shufflePlayerOrder(playerNames, seed)` (deterministik, tidak perlu disimpan)
   - Ambil `playerOrder[drawnPlayerCount]`
   - Assign teams via `drawForPlayer()`
   - Push ke `pool.players`
   - Increment `drawnPlayerCount`
   - Jika `drawnPlayerCount === playerNames.length`: status → `'drawn'`

3. Batch draw: tetap pakai `runDraw()` existing, langsung `'drawn'`.

### UX Sequential Draw (`DrawSequential.vue`)

```
┌─────────────────────────────────────┐
│  Pemain 2 / 5                       │
│                                     │
│  Giliran: BUDI                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      🎲 Tarik Undian!       │   │  ← tombol besar
│  └─────────────────────────────┘   │
│                                     │
│  (Setelah undi: animasi reveal)     │
│  🇧🇷 Brasil  🇩🇪 Jerman  🇦🇷 Argentina │
│                                     │
│         [ Lanjut → ]                │
└─────────────────────────────────────┘
```

- Setelah semua selesai → langsung ke Dashboard (tidak melewati DrawReveal batch)

---

## 3. Prize System

### Setup Form (tambahan)

Mode hadiah dipilih di setup, di bawah aturan main:

```
Sistem hadiah
( ) Winner-takes-all
(●) 3 Pemenang
    Juara 1: [50]%   Juara 2: [30]%   Juara 3: [20]%
    (Live: total = 100% — normalize otomatis saat blur)
```

### SettlePanel (modifikasi)

**Winner-takes-all mode:** tampilan existing.

**Tiered mode:** tiga autocomplete/searchable dropdown:
- Juara 1 → `championTeamId`
- Juara 2 → `champion2TeamId`
- Juara 3 → `champion3TeamId`

Jika negara juara ada di bank → tampil `"🏦 Hadiah ke bank"`.

### Dashboard (tambahan)

**Tiered mode:**

```
🥇 Juara 1  Budi (🇧🇷 Brasil)      Rp 2.500.000   50%
🥈 Juara 2  Sari (🇩🇪 Jerman)      Rp 1.500.000   30%
🥉 Juara 3  Agus (🇦🇷 Argentina)   Rp 1.000.000   20%
```

### Store Getter Baru

```typescript
// Getter untuk tiered mode
winners(state): Array<{
  place: 1 | 2 | 3
  player: Player | null   // null jika negara di bank
  teamId: string | null
  amount: number          // pot × (split / 100)
}>
```

Getter `winner` existing tetap dipakai untuk winner-takes-all mode.

---

## 4. Team Selection

### Komponen `TeamPicker.vue`

Grid 2 kolom (mobile) / 3+ kolom (desktop), dikelompokkan per Grup A–L.

```
[ Pilih Semua ]  [ Hapus Semua ]   (X dipilih dari 48)

Grup A                   Grup B
[✓] 🇿🇦 Afrika Selatan  [✓] 🇧🇦 Bosnia-Herzegovina
[✓] 🇰🇷 Korea Selatan   [✓] 🇨🇦 Kanada
...
```

Props: `modelValue: string[] | null`, emit `update:modelValue`.

Dipakai di `SetupForm.vue` sebagai section terpisah (bisa di-collapse).

### Implikasi ke Draw

```typescript
// Store getter baru
effectiveTeams(state): Team[] {
  if (!state.pool.includedTeamIds) return TEAMS
  const ids = new Set(state.pool.includedTeamIds)
  return TEAMS.filter(t => ids.has(t.id))
}
```

Semua kalkulasi `maxPlayers`, `teamsNeeded`, `overCapacity`, `bankTeamIds` gunakan `effectiveTeams` bukan `TEAMS` langsung.

---

## 5. Component Map

### File Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/types.ts` | Tambah `DrawMode`, `PrizeMode`, `PrizeSplit`; update `PoolStatus`, `Pool` |
| `src/stores/pool.ts` | State baru, getters `effectiveTeams`/`winners`, actions `startSequentialDraw`/`drawNextPlayer`/`setChampion2`/`setChampion3` |
| `src/lib/draw.ts` | Tambah `shufflePlayerOrder()`, `drawForPlayer()` |
| `src/App.vue` | Handle phase `'drawing'` → render `DrawSequential`; phase `'reveal'` hanya untuk batch |
| `src/components/SetupForm.vue` | Tambah `TeamPicker`, prize mode config, draw mode toggle |
| `src/components/DrawReveal.vue` | Hanya dipakai untuk batch mode; sequential pakai `DrawSequential` |
| `src/components/SettlePanel.vue` | Tiered: 3 input juara; winner-takes-all: existing |
| `src/components/Dashboard.vue` | Tampil multiple winners + prize amounts di tiered mode |

### File Baru

| File | Tujuan |
|------|--------|
| `src/components/TeamPicker.vue` | Grid checkbox 48 negara dikelompokkan per grup |
| `src/components/DrawSequential.vue` | UI undian giliran: "siapa dapat giliran", tombol undi, animasi reveal |

---

## 6. Error Handling & Edge Cases

- **PrizeSplit tidak sum ke 100**: normalize proporsional saat submit (bukan saat typing)
- **Negara terpilih < yang dibutuhkan**: error message existing sudah cover ini via `overCapacity`
- **Sequential draw terputus di tengah** (refresh browser): status `'drawing'` di-load, UI kembali ke pemain berikutnya (`drawnPlayerCount` sudah tersimpan)
- **Juara yang sama diinput 2x** (tiered): validasi di SettlePanel — tidak boleh pilih negara yang sama untuk juara yang berbeda
- **Tiered: semua juara di bank**: tampil informasi jelas tanpa crash

---

## 7. Out of Scope

- Multi-device sync (backend/realtime)
- Export PDF
- History undian sebelumnya
- Undo draw per pemain

---

## 8. Implementation Order (rekomendasi)

1. Data model (`types.ts`, `blankPool`)
2. Draw engine (`draw.ts` — fungsi baru)
3. Store (`pool.ts` — state, getters, actions)
4. Team selection (`TeamPicker.vue` + integrasi ke `SetupForm`)
5. Draw sequential (`DrawSequential.vue` + `App.vue` routing)
6. Prize tiered (`SettlePanel`, `Dashboard`)
7. Polish & integration test
