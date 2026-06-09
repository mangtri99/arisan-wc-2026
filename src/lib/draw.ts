import type { Player, Team } from '../types'

// RNG ber-seed (mulberry32) supaya undian bisa diulang & diverifikasi.
// Seed string yang sama -> hasil undian identik => "provably fair".
function makeRng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let seed = (h ^ (h >>> 16)) >>> 0
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Fisher-Yates shuffle yang deterministik terhadap seed.
function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export interface DrawResult {
  players: Player[]
  bankTeamIds: string[] // negara yang tidak kebagian pemain (milik "rumah")
}

/**
 * Bagikan negara ke setiap pemain secara acak & unik (tanpa duplikat).
 * Jumlah negara per orang TETAP. Sisa negara masuk ke "bank".
 */
export function drawTeams(
  teams: Team[],
  playerNames: string[],
  teamsPerPlayer: number,
  seed: string,
): DrawResult {
  const order = shuffle(teams, makeRng(seed))
  const players: Player[] = playerNames.map((name, idx) => {
    const start = idx * teamsPerPlayer
    return {
      id: `p${idx}-${slug(name)}`,
      name,
      teamIds: order.slice(start, start + teamsPerPlayer).map((t) => t.id),
    }
  })
  const used = playerNames.length * teamsPerPlayer
  const bankTeamIds = order.slice(used).map((t) => t.id)
  return { players, bankTeamIds }
}

export function randomSeed(): string {
  // seed pendek yang mudah dibacakan & dicocokkan bareng-bareng
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
