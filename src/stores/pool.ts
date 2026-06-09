import { defineStore } from 'pinia'
import { TEAMS, TEAM_BY_ID, TOTAL_TEAMS } from '../data/teams'
import { drawTeams, randomSeed } from '../lib/draw'
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
    maxPlayers(state): number {
      return Math.floor(TOTAL_TEAMS / Math.max(1, state.pool.teamsPerPlayer))
    },
    teamsNeeded(state): number {
      return state.pool.playerNames.length * state.pool.teamsPerPlayer
    },
    overCapacity(): boolean {
      return this.teamsNeeded > TOTAL_TEAMS
    },
    pot(state): number {
      return state.pool.players.length * state.pool.betAmount
    },
    bankTeamIds(state): string[] {
      const taken = new Set(state.pool.players.flatMap((p) => p.teamIds))
      return TEAMS.filter((t) => !taken.has(t.id)).map((t) => t.id)
    },
    championTeam(state): Team | null {
      return state.pool.championTeamId
        ? TEAM_BY_ID[state.pool.championTeamId] ?? null
        : null
    },
    // Winner-takes-all: pemegang negara juara mengambil seluruh pot.
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
        TEAMS,
        pool.playerNames,
        pool.teamsPerPlayer,
        pool.seed,
      )
      pool.players = players
      pool.status = 'drawn'
      pool.championTeamId = null
      pool.drawnAt = new Date().toISOString()
      this.persist()
    },

    setChampion(teamId: string) {
      this.pool.championTeamId = teamId
      this.pool.status = 'settled'
      this.persist()
    },

    clearChampion() {
      this.pool.championTeamId = null
      this.pool.status = 'drawn'
      this.persist()
    },

    reset() {
      this.pool = blankPool()
      this.persist()
    },
  },
})
