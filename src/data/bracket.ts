// Struktur bagan fase gugur Piala Dunia 2026 (32 besar → final).
// Sumber kebenaran tunggal untuk matchup & pembagian sisi kiri/kanan.
// Slot R32 menunjuk ke teamId; ronde lanjut menunjuk ke pemenang (ref) match sebelumnya.

export type BracketSide = 'left' | 'right' | 'center'

export interface BracketSlot {
  teamId?: string // diisi pada babak 32 besar
  ref?: string // mis. 'W74' (pemenang M74) atau 'RU101' (runner-up M101)
}

export interface BracketMatch {
  id: string // mis. 'M74'
  date: string // mis. '30/6/2026'
  time: string // mis. '04:30'
  side: BracketSide
  slots: [BracketSlot, BracketSlot]
}

export interface BracketRound {
  key: string
  label: string
  matches: BracketMatch[]
}

const t = (teamId: string): BracketSlot => ({ teamId })
const w = (ref: string): BracketSlot => ({ ref })

// Babak 32 Besar — 16 match (8 kiri, 8 kanan).
const round32: BracketMatch[] = [
  // kiri
  { id: 'M74', date: '30/6/2026', time: '04:30', side: 'left', slots: [t('GER'), t('PAR')] },
  { id: 'M77', date: '1/7/2026', time: '05:00', side: 'left', slots: [t('FRA'), t('SWE')] },
  { id: 'M73', date: '29/6/2026', time: '03:00', side: 'left', slots: [t('RSA'), t('CAN')] },
  { id: 'M75', date: '30/6/2026', time: '09:00', side: 'left', slots: [t('NED'), t('MAR')] },
  { id: 'M83', date: '3/7/2026', time: '07:00', side: 'left', slots: [t('POR'), t('CRO')] },
  { id: 'M84', date: '3/7/2026', time: '03:00', side: 'left', slots: [t('ESP'), t('AUT')] },
  { id: 'M81', date: '2/7/2026', time: '08:00', side: 'left', slots: [t('USA'), t('BIH')] },
  { id: 'M82', date: '2/7/2026', time: '04:00', side: 'left', slots: [t('BEL'), t('SEN')] },
  // kanan
  { id: 'M76', date: '30/6/2026', time: '01:00', side: 'right', slots: [t('BRA'), t('JPN')] },
  { id: 'M78', date: '1/7/2026', time: '01:00', side: 'right', slots: [t('CIV'), t('NOR')] },
  { id: 'M79', date: '1/7/2026', time: '09:00', side: 'right', slots: [t('MEX'), t('ECU')] },
  { id: 'M80', date: '2/7/2026', time: '00:00', side: 'right', slots: [t('ENG'), t('COD')] },
  { id: 'M86', date: '4/7/2026', time: '06:00', side: 'right', slots: [t('ARG'), t('CPV')] },
  { id: 'M88', date: '4/7/2026', time: '02:00', side: 'right', slots: [t('AUS'), t('EGY')] },
  { id: 'M85', date: '3/7/2026', time: '11:00', side: 'right', slots: [t('SUI'), t('ALG')] },
  { id: 'M87', date: '4/7/2026', time: '09:30', side: 'right', slots: [t('COL'), t('GHA')] },
]

const round16: BracketMatch[] = [
  // kiri
  { id: 'M89', date: '5/7/2026', time: '05:00', side: 'left', slots: [w('W74'), w('W77')] },
  { id: 'M90', date: '5/7/2026', time: '01:00', side: 'left', slots: [w('W73'), w('W75')] },
  { id: 'M93', date: '7/7/2026', time: '03:00', side: 'left', slots: [w('W83'), w('W84')] },
  { id: 'M94', date: '7/7/2026', time: '08:00', side: 'left', slots: [w('W81'), w('W82')] },
  // kanan
  { id: 'M91', date: '6/7/2026', time: '04:00', side: 'right', slots: [w('W76'), w('W78')] },
  { id: 'M92', date: '6/7/2026', time: '08:00', side: 'right', slots: [w('W79'), w('W80')] },
  { id: 'M95', date: '8/7/2026', time: '00:00', side: 'right', slots: [w('W86'), w('W88')] },
  { id: 'M96', date: '8/7/2026', time: '04:00', side: 'right', slots: [w('W85'), w('W87')] },
]

const quarter: BracketMatch[] = [
  { id: 'M97', date: '10/7/2026', time: '04:00', side: 'left', slots: [w('W89'), w('W90')] },
  { id: 'M98', date: '11/7/2026', time: '03:00', side: 'left', slots: [w('W93'), w('W94')] },
  { id: 'M99', date: '12/7/2026', time: '05:00', side: 'right', slots: [w('W91'), w('W92')] },
  { id: 'M100', date: '12/7/2026', time: '09:00', side: 'right', slots: [w('W95'), w('W96')] },
]

const semi: BracketMatch[] = [
  { id: 'M101', date: '15/7/2026', time: '03:00', side: 'left', slots: [w('W97'), w('W98')] },
  { id: 'M102', date: '16/7/2026', time: '03:00', side: 'right', slots: [w('W99'), w('W100')] },
]

const final: BracketMatch[] = [
  { id: 'M104', date: '20/7/2026', time: '03:00', side: 'center', slots: [w('W101'), w('W102')] },
]

// Play-off perebutan peringkat ketiga (kalah semifinal).
export const THIRD_PLACE: BracketMatch = {
  id: 'M103',
  date: '19/7/2026',
  time: '05:00',
  side: 'center',
  slots: [w('RU101'), w('RU102')],
}

export const ROUNDS: BracketRound[] = [
  { key: 'r32', label: 'Babak 32 Besar', matches: round32 },
  { key: 'r16', label: 'Putaran 16 Besar', matches: round16 },
  { key: 'qf', label: 'Perempat-final', matches: quarter },
  { key: 'sf', label: 'Semi-final', matches: semi },
  { key: 'final', label: 'Final', matches: final },
]

// Pembagian sisi diturunkan dari babak 32 besar (single source of truth).
export const LEFT_TEAM_IDS: string[] = round32
  .filter((m) => m.side === 'left')
  .flatMap((m) => m.slots.map((s) => s.teamId!))

export const RIGHT_TEAM_IDS: string[] = round32
  .filter((m) => m.side === 'right')
  .flatMap((m) => m.slots.map((s) => s.teamId!))
