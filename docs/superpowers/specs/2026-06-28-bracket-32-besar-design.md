# 32 Besar + Bagan Fase Gugur

## Goal

- Ganti pool peserta dari 48 → 32 tim (babak 32 besar / fase gugur).
- Tampilkan bagan fase gugur (knockout bracket) di halaman home, statis, mengikuti struktur FIFA WC 2026.
- Undian: tim tiap pemain dibagi rata antara bracket kiri & kanan. Genap → split rata; ganjil → selisih 1, arah acak per pemain (balanced global).

## Data

`src/data/bracket.ts` — **canonical**. Struktur knockout:

- Rounds: R32 → R16 → QF → SF → Final (+ play-off peringkat 3).
- Tiap match: `{ id, date, time, side: 'left'|'right'|'center', slots: [slot, slot] }`.
  - Slot R32 = `{ teamId }`. Slot ronde lanjut = `{ ref: 'W74' | 'RU101' }`.
- `LEFT_TEAM_IDS` / `RIGHT_TEAM_IDS` diturunkan dari match R32 (bukan field manual di teams.ts → no drift).

R32 kiri: GER/PAR, FRA/SWE, RSA/CAN, NED/MAR, POR/CRO, ESP/AUT, USA/BIH, BEL/SEN.
R32 kanan: BRA/JPN, CIV/NOR, MEX/ECU, ENG/COD, ARG/CPV, AUS/EGY, SUI/ALG, COL/GHA.

`src/data/teams.ts` — dipangkas ke 32 tim di atas. `TOTAL_TEAMS` ikut jadi 32.

## Draw (`src/lib/draw.ts`, TDD)

- `computeAllocation(numPlayers, k, seed)` → array `{ leftCount, rightCount }` per pemain.
  - base = `floor(k/2)` tiap sisi; jika `k` ganjil, 1 extra; arah extra di-balance antar pemain (seeded shuffle dari `['L'..,'R'..]`).
- Pool kiri (16) & kanan (16) di-shuffle pakai stream seed terpisah (`seed+':L'`, `seed+':R'`).
- Offset kumulatif dari allocation → slice pool. Batch & sequential pakai allocation sama → hasil identik.
- Locked 32 (16/16) + UI cap k≤5 → tidak pernah overflow (worst case k=1, 32 pemain = 16/16).

Tests baru: per-pemain L/R count = floor/ceil(k/2); tidak over-draw pool; no overlap; batch == sequential; determinisme seed.

## Store (`src/stores/pool.ts`)

- Bump `STORAGE_KEY` → `arisan-pd-2026-v3` (pool lama referensi tim yg dihapus → dashboard rusak).
- `includedTeamIds` tetap ada (shape), subset usage di-drop.

## UI

- `src/components/BracketDiagram.vue` (baru): 9 kolom knockout, tema dark app (bukan light FIFA), slot lanjut tampil (W74…), mobile = horizontal scroll. Statis, tidak terkait hasil arisan.
- `src/components/SetupForm.vue`: hapus panel TeamPicker subset, perbaiki hardcoded `48`→32, render `<BracketDiagram>` selalu tampil di bawah form.

## Scope

~7 file. Connector elbow CSS = terakhir/opsional. Prioritas: matchup benar + kolom + slot.
