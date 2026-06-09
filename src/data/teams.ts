import type { Team } from '../types'

// 48 peserta Piala Dunia 2026 sesuai hasil undian resmi FIFA (Grup A–L).
// Tuan rumah: Amerika Serikat, Kanada, Meksiko. Juara bertahan: Argentina.
export const TEAMS: Team[] = [
  // Grup A
  { id: 'RSA', name: 'Afrika Selatan', flag: '🇿🇦', group: 'A' },
  { id: 'KOR', name: 'Korea Selatan', flag: '🇰🇷', group: 'A' },
  { id: 'MEX', name: 'Meksiko', flag: '🇲🇽', group: 'A' },
  { id: 'CZE', name: 'Republik Ceko', flag: '🇨🇿', group: 'A' },
  // Grup B
  { id: 'BIH', name: 'Bosnia-Herzegovina', flag: '🇧🇦', group: 'B' },
  { id: 'CAN', name: 'Kanada', flag: '🇨🇦', group: 'B' },
  { id: 'QAT', name: 'Qatar', flag: '🇶🇦', group: 'B' },
  { id: 'SUI', name: 'Swiss', flag: '🇨🇭', group: 'B' },
  // Grup C
  { id: 'BRA', name: 'Brasil', flag: '🇧🇷', group: 'C' },
  { id: 'HAI', name: 'Haiti', flag: '🇭🇹', group: 'C' },
  { id: 'MAR', name: 'Maroko', flag: '🇲🇦', group: 'C' },
  { id: 'SCO', name: 'Skotlandia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },
  // Grup D
  { id: 'USA', name: 'Amerika Serikat', flag: '🇺🇸', group: 'D' },
  { id: 'AUS', name: 'Australia', flag: '🇦🇺', group: 'D' },
  { id: 'PAR', name: 'Paraguay', flag: '🇵🇾', group: 'D' },
  { id: 'TUR', name: 'Turki', flag: '🇹🇷', group: 'D' },
  // Grup E
  { id: 'CUW', name: 'Curacao', flag: '🇨🇼', group: 'E' },
  { id: 'ECU', name: 'Ekuador', flag: '🇪🇨', group: 'E' },
  { id: 'GER', name: 'Jerman', flag: '🇩🇪', group: 'E' },
  { id: 'CIV', name: 'Pantai Gading', flag: '🇨🇮', group: 'E' },
  // Grup F
  { id: 'NED', name: 'Belanda', flag: '🇳🇱', group: 'F' },
  { id: 'JPN', name: 'Jepang', flag: '🇯🇵', group: 'F' },
  { id: 'SWE', name: 'Swedia', flag: '🇸🇪', group: 'F' },
  { id: 'TUN', name: 'Tunisia', flag: '🇹🇳', group: 'F' },
  // Grup G
  { id: 'BEL', name: 'Belgia', flag: '🇧🇪', group: 'G' },
  { id: 'IRN', name: 'Iran', flag: '🇮🇷', group: 'G' },
  { id: 'EGY', name: 'Mesir', flag: '🇪🇬', group: 'G' },
  { id: 'NZL', name: 'Selandia Baru', flag: '🇳🇿', group: 'G' },
  // Grup H
  { id: 'KSA', name: 'Arab Saudi', flag: '🇸🇦', group: 'H' },
  { id: 'CPV', name: 'Tanjung Verde', flag: '🇨🇻', group: 'H' },
  { id: 'ESP', name: 'Spanyol', flag: '🇪🇸', group: 'H' },
  { id: 'URU', name: 'Uruguay', flag: '🇺🇾', group: 'H' },
  // Grup I
  { id: 'IRQ', name: 'Irak', flag: '🇮🇶', group: 'I' },
  { id: 'NOR', name: 'Norwegia', flag: '🇳🇴', group: 'I' },
  { id: 'FRA', name: 'Prancis', flag: '🇫🇷', group: 'I' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳', group: 'I' },
  // Grup J
  { id: 'ALG', name: 'Aljazair', flag: '🇩🇿', group: 'J' },
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'J' },
  { id: 'AUT', name: 'Austria', flag: '🇦🇹', group: 'J' },
  { id: 'JOR', name: 'Yordania', flag: '🇯🇴', group: 'J' },
  // Grup K
  { id: 'COL', name: 'Kolombia', flag: '🇨🇴', group: 'K' },
  { id: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'K' },
  { id: 'COD', name: 'RD Kongo', flag: '🇨🇩', group: 'K' },
  { id: 'UZB', name: 'Uzbekistan', flag: '🇺🇿', group: 'K' },
  // Grup L
  { id: 'GHA', name: 'Ghana', flag: '🇬🇭', group: 'L' },
  { id: 'ENG', name: 'Inggris', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
  { id: 'CRO', name: 'Kroasia', flag: '🇭🇷', group: 'L' },
  { id: 'PAN', name: 'Panama', flag: '🇵🇦', group: 'L' },
]

export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
)

export const TOTAL_TEAMS = TEAMS.length
