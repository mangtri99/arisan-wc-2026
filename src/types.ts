export interface Team {
  id: string
  name: string
  flag: string
  group: string
}

export interface Player {
  id: string
  name: string
  teamIds: string[]
}

export type PoolStatus = 'draft' | 'drawing' | 'drawn' | 'settled'
export type DrawMode = 'batch' | 'sequential'
export type PrizeMode = 'winner-takes-all' | 'tiered'

export interface PrizeSplit {
  first: number
  second: number
  third: number
}

export interface Pool {
  title: string
  playerNames: string[]
  players: Player[]
  teamsPerPlayer: number
  betAmount: number
  seed: string
  status: PoolStatus
  championTeamId: string | null
  drawnAt: string | null
  // v2
  includedTeamIds: string[] | null
  drawMode: DrawMode
  prizeMode: PrizeMode
  prizeSplit: PrizeSplit
  drawnPlayerCount: number
  champion2TeamId: string | null
  champion3TeamId: string | null
}
