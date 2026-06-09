import { defineStore } from 'pinia'
import { TEAMS, TEAM_BY_ID } from '../data/teams'
import { drawTeams, randomSeed, shufflePlayerOrder, drawForPlayer } from '../lib/draw'
import type { Player, Pool, Team } from '../types'

const STORAGE_KEY = 'arisan-pd-2026'

function blankPool(): Pool {
  return {
    title: 'Arisan Piala Dunia 2026',
    playerNames: [],
    players: [],
    teamsPerPlayer: 3,
    betAmount: 50000,
    seed: randomSeed(),
    status: 'draft',
    championTeamId: null,
    drawnAt: null,
    // v2
    includedTeamIds: null,
    drawMode: 'batch',
    prizeMode: 'winner-takes-all',
    prizeSplit: { first: 50, second: 30, third: 20 },
    drawnPlayerCount: 0,
    champion2TeamId: null,
    champion3TeamId: null,
  }
}

function load(): Pool {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...blankPool(), ...JSON.parse(raw) }
  } catch {
    /* abaikan, mulai bersih */
  }
  return blankPool()
}

export const usePoolStore = defineStore('pool', {
  state: () => ({ pool: load() }),

  getters: {
    allTeams: (): Team[] => TEAMS,

    effectiveTeams(state): Team[] {
      if (!state.pool.includedTeamIds) return TEAMS
      const ids = new Set(state.pool.includedTeamIds)
      return TEAMS.filter((t) => ids.has(t.id))
    },

    maxPlayers(): number {
      return Math.floor(this.effectiveTeams.length / Math.max(1, this.pool.teamsPerPlayer))
    },

    teamsNeeded(state): number {
      return state.pool.playerNames.length * state.pool.teamsPerPlayer
    },

    overCapacity(): boolean {
      return this.teamsNeeded > this.effectiveTeams.length
    },

    pot(state): number {
      return state.pool.players.length * state.pool.betAmount
    },

    bankTeamIds(state): string[] {
      const taken = new Set(state.pool.players.flatMap((p) => p.teamIds))
      return this.effectiveTeams.filter((t) => !taken.has(t.id)).map((t) => t.id)
    },

    championTeam(state): Team | null {
      return state.pool.championTeamId
        ? TEAM_BY_ID[state.pool.championTeamId] ?? null
        : null
    },

    winner(state): Player | null {
      if (!state.pool.championTeamId) return null
      return (
        state.pool.players.find((p) =>
          p.teamIds.includes(state.pool.championTeamId as string),
        ) ?? null
      )
    },

    championInBank(): boolean {
      return this.pool.status === 'settled' && !!this.pool.championTeamId && !this.winner
    },

    playerDrawOrder(state): string[] {
      if (state.pool.drawMode !== 'sequential') return state.pool.playerNames
      return shufflePlayerOrder(state.pool.playerNames, state.pool.seed)
    },

    winners(): Array<{
      place: 1 | 2 | 3
      player: Player | null
      teamId: string | null
      amount: number
    }> {
      const { pool } = this
      if (pool.prizeMode !== 'tiered') return []
      return (
        [
          { place: 1 as const, teamId: pool.championTeamId, pct: pool.prizeSplit.first },
          { place: 2 as const, teamId: pool.champion2TeamId, pct: pool.prizeSplit.second },
          { place: 3 as const, teamId: pool.champion3TeamId, pct: pool.prizeSplit.third },
        ] as const
      ).map(({ place, teamId, pct }) => ({
        place,
        teamId,
        player: teamId
          ? pool.players.find((p) => p.teamIds.includes(teamId)) ?? null
          : null,
        amount: Math.round(this.pot * (pct / 100)),
      }))
    },
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pool))
      } catch {
        /* storage penuh / diblokir — abaikan saja */
      }
    },

    setPlayerNames(names: string[]) {
      this.pool.playerNames = names
      this.persist()
    },

    regenerateSeed() {
      this.pool.seed = randomSeed()
      this.persist()
    },

    runDraw() {
      const { pool } = this
      if (pool.playerNames.length === 0 || this.overCapacity) return
      const { players } = drawTeams(
        this.effectiveTeams,
        pool.playerNames,
        pool.teamsPerPlayer,
        pool.seed,
      )
      pool.players = players
      pool.drawnPlayerCount = 0
      pool.status = 'drawn'
      pool.championTeamId = null
      pool.champion2TeamId = null
      pool.champion3TeamId = null
      pool.drawnAt = new Date().toISOString()
      this.persist()
    },

    startSequentialDraw() {
      const { pool } = this
      if (pool.playerNames.length === 0 || this.overCapacity) return
      pool.players = []
      pool.drawnPlayerCount = 0
      pool.championTeamId = null
      pool.champion2TeamId = null
      pool.champion3TeamId = null
      pool.drawnAt = null
      pool.status = 'drawing'
      this.persist()
    },

    drawNextPlayer() {
      const { pool } = this
      if (pool.status !== 'drawing') return
      if (pool.drawnPlayerCount >= pool.playerNames.length) return
      const playerOrder = shufflePlayerOrder(pool.playerNames, pool.seed)
      const player = drawForPlayer(
        this.effectiveTeams,
        playerOrder,
        pool.teamsPerPlayer,
        pool.seed,
        pool.drawnPlayerCount,
      )
      pool.players.push(player)
      pool.drawnPlayerCount++
      this.persist()
    },

    finalizeSequentialDraw() {
      const { pool } = this
      if (pool.status === 'drawing' && pool.drawnPlayerCount >= pool.playerNames.length) {
        pool.status = 'drawn'
        pool.drawnAt = new Date().toISOString()
        this.persist()
      }
    },

    setChampion(teamId: string) {
      this.pool.championTeamId = teamId
      this.pool.status = 'settled'
      this.persist()
    },

    setChampion2(teamId: string) {
      this.pool.champion2TeamId = teamId
      this.persist()
    },

    setChampion3(teamId: string) {
      this.pool.champion3TeamId = teamId
      this.persist()
    },

    settlePool() {
      this.pool.status = 'settled'
      this.persist()
    },

    clearChampion() {
      this.pool.championTeamId = null
      this.pool.champion2TeamId = null
      this.pool.champion3TeamId = null
      this.pool.status = 'drawn'
      this.persist()
    },

    setIncludedTeams(teamIds: string[] | null) {
      this.pool.includedTeamIds = teamIds
      this.persist()
    },

    reset() {
      this.pool = blankPool()
      this.persist()
    },
  },
})
