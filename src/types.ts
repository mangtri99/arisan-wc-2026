export interface Team {
  id: string // kode singkat, mis. "ARG"
  name: string // nama negara dalam Bahasa Indonesia
  flag: string // emoji bendera
  group: string // "A" .. "L"
}

export interface Player {
  id: string
  name: string
  teamIds: string[] // negara hasil undian
}

export type PoolStatus = 'draft' | 'drawn' | 'settled'

export interface Pool {
  title: string
  playerNames: string[] // input mentah dari form
  players: Player[] // hasil setelah diundi
  teamsPerPlayer: number // jumlah negara per orang (tetap)
  betAmount: number // taruhan seragam per orang (Rupiah)
  seed: string // untuk undian provably fair
  status: PoolStatus
  championTeamId: string | null // diisi setelah final
  drawnAt: string | null
}
