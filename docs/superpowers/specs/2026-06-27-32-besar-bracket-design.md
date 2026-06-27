# Fitur 32 Besar + Braket Knockout — Design

Tanggal: 2026-06-27
Status: Disetujui

## Tujuan

Piala Dunia 2026 masuk babak gugur (32 besar). Dua hal:

1. **Batasi pool undian arisan ke tim yang lolos** — undian hanya pakai tim 32 besar, bukan 48.
2. **Braket knockout ala FIFA** — tampilan display-only R32 → Final, mirip halaman standings FIFA.

Sumber data: hasil grup Piala Dunia 2026 asli (NBC Sports / FIFA standings).

## Konteks codebase

- Vue 3 + Pinia + Tailwind. Data tim di `src/data/teams.ts` (48 tim, grup A–L).
- Store `src/stores/pool.ts` sudah punya `includedTeamIds` + `setIncludedTeams()` + getter `effectiveTeams` → infra pembatasan pool sudah ada.
- `App.vue` fase: setup → reveal/sequential → dashboard. Braket akan tampil di Dashboard.

## Data hasil grup (final, dari NBC Sports)

Top-2 tiap grup + 8 peringkat-3 terbaik lolos (32 dari 48).

| Grup | Juara | Runner-up | Peringkat-3 (poin) |
|------|-------|-----------|--------------------|
| A | Meksiko | Afrika Selatan | Korea Selatan (3) |
| B | Swiss | Kanada | Bosnia (4) ✓ |
| C | Brasil | Maroko | Skotlandia (3) |
| D | Amerika Serikat | Australia | Paraguay (4) ✓ |
| E | Jerman | Pantai Gading | Ekuador (4) ✓ |
| F | Belanda | Jepang | Swedia (4) ✓ |
| G | Belgia | Mesir | Iran (3) |
| H | Spanyol | Tanjung Verde | Uruguay (2) ✗ |
| I | Prancis | Norwegia | Senegal (0) ✗ |
| J | Argentina | Austria | Aljazair (3) |
| K | Kolombia | Portugal | RD Kongo (1) ✗ |
| L | Inggris | Ghana | Kroasia (3) |

**Lolos pasti (28 tim):** 12 juara + 12 runner-up + 4 peringkat-3 berpoin 4 (Bosnia, Paraguay, Ekuador, Swedia).

**Slot pending (4):** dari 5 tim seri 3 poin — Korea Selatan, Skotlandia, Iran, Aljazair, Kroasia — 4 lolos, 1 gugur via selisih gol (belum terkunci per 27 Juni). Diencode sebagai placeholder `TBD`.

## Pairing Round of 32 (posisi braket FIFA)

11 pairing konkret + 5 lawan peringkat-3 (TBD):

1. Afrika Selatan vs Kanada
2. Jerman vs Paraguay
3. Brasil vs Jepang
4. Belanda vs Maroko
5. Pantai Gading vs Norwegia
6. Prancis vs Swedia
7. Meksiko vs `[Peringkat-3 TBD]`
8. Inggris vs `[Peringkat-3 TBD]`
9. Amerika Serikat vs Bosnia
10. Belgia vs `[Peringkat-3 TBD]`
11. Spanyol vs Austria
12. Portugal vs Ghana
13. Swiss vs `[Peringkat-3 TBD]`
14. Australia vs Mesir
15. Argentina vs Tanjung Verde
16. Kolombia vs `[Peringkat-3 TBD]`

R16 → QF → SF → Final: slot "Pemenang Match N" (kosong/TBD, display-only).

## Arsitektur

### 1. `src/data/bracket.ts` (file baru)

```ts
type Slot =
  | { kind: 'team'; teamId: string }
  | { kind: 'tbd'; label: string }   // "Peringkat-3", "Pemenang M1"

interface Match {
  id: number
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'F'
  home: Slot
  away: Slot
  date?: string
  venue?: string
}

export const BRACKET: Match[]
export const QUALIFIED_32: string[]  // 28 id konkret (4 TBD tidak masuk daftar drawable)
```

- `QUALIFIED_32` = 28 id pasti. Saat selisih gol keluar, tambah 4 id → 32.
- File editable: user update saat hasil knockout masuk Juli (isi `tbd` slot jadi `team`).

### 2. Pembatasan pool — tombol "32 Besar"

- Di `SetupForm.vue` (atau `TeamPicker.vue`): tombol preset **"32 Besar"**.
- Aksi: `setIncludedTeams(QUALIFIED_32)` lalu `reset()` ke draft → pemain undi ulang dari tim yang lolos.
- Pool sementara 28 tim sampai 4 slot TBD difinalisasi.

### 3. `src/components/BracketView.vue` (komponen baru, display-only)

- Render kolom R32 → R16 → QF → SF → Final ala FIFA.
- Slot `team`: bendera + nama. Slot `tbd`: abu-abu, label placeholder.
- Highlight tim yang dimiliki pemain (cocokkan `teamId` dengan `pool.players[].teamIds`).
- Tampil sebagai section/tab di `Dashboard.vue`.

## Non-goals (YAGNI)

- Braket interaktif (klik pemenang, auto-advance) — tidak. Display-only.
- Edit braket dari UI — tidak. Update via `bracket.ts`.
- Skor pertandingan — tidak. Hanya pairing + struktur.

## Testing

- Unit: `QUALIFIED_32` punya 28 id unik, semua ada di `TEAM_BY_ID`.
- Unit: tiap `Slot` bertipe `team` punya `teamId` valid.
- Unit: tombol "32 Besar" set `includedTeamIds` = `QUALIFIED_32` dan status balik `draft`.

## Open item

- 4 slot peringkat-3 pending selisih gol. Finalisasi `bracket.ts` saat data resmi keluar (≥28 Juni).
