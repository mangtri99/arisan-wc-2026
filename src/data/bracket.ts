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
