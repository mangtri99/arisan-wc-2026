import type { Player, Team } from '../types'
import { LEFT_TEAM_IDS } from '../data/bracket'

const LEFT_SET = new Set(LEFT_TEAM_IDS)

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

export interface Allocation {
  leftCount: number
  rightCount: number
}

/**
 * Tentukan berapa negara dari bracket KIRI vs KANAN untuk tiap pemain.
 * Genap: split rata. Ganjil: selisih 1, arah extra di-balance antar pemain
 * (seeded) supaya kedua pool (16/16) tidak timpang. Deterministik thd seed.
 */
export function computeAllocation(
  numPlayers: number,
  teamsPerPlayer: number,
  seed: string,
): Allocation[] {
  const base = Math.floor(teamsPerPlayer / 2)
  const hasExtra = teamsPerPlayer % 2 === 1
  if (!hasExtra) {
    return Array.from({ length: numPlayers }, () => ({ leftCount: base, rightCount: base }))
  }
  // Bagi arah extra: setengah ke kiri, setengah ke kanan, lalu diacak.
  const nLeft = Math.ceil(numPlayers / 2)
  const dirs = Array.from({ length: numPlayers }, (_, i) => (i < nLeft ? 'L' : 'R'))
  const shuffled = shuffle(dirs, makeRng(seed + ':dir'))
  return shuffled.map((d) =>
    d === 'L'
      ? { leftCount: base + 1, rightCount: base }
      : { leftCount: base, rightCount: base + 1 },
  )
}

function splitBySide(teams: Team[]): { left: Team[]; right: Team[] } {
  const left: Team[] = []
  const right: Team[] = []
  for (const t of teams) (LEFT_SET.has(t.id) ? left : right).push(t)
  return { left, right }
}

/**
 * Bagikan negara ke setiap pemain secara acak & unik (tanpa duplikat),
 * dengan keseimbangan bracket kiri/kanan. Sisa negara masuk ke "bank".
 */
export function drawTeams(
  teams: Team[],
  playerNames: string[],
  teamsPerPlayer: number,
  seed: string,
): DrawResult {
  const { left, right } = splitBySide(teams)
  const shuffledL = shuffle(left, makeRng(seed + ':L'))
  const shuffledR = shuffle(right, makeRng(seed + ':R'))
  const alloc = computeAllocation(playerNames.length, teamsPerPlayer, seed)

  let lOff = 0
  let rOff = 0
  const players: Player[] = playerNames.map((name, idx) => {
    const { leftCount, rightCount } = alloc[idx]
    const lt = shuffledL.slice(lOff, lOff + leftCount)
    const rt = shuffledR.slice(rOff, rOff + rightCount)
    lOff += leftCount
    rOff += rightCount
    return {
      id: `p${idx}-${slug(name)}`,
      name,
      teamIds: [...lt, ...rt].map((t) => t.id),
    }
  })

  const bankTeamIds = [
    ...shuffledL.slice(lOff).map((t) => t.id),
    ...shuffledR.slice(rOff).map((t) => t.id),
  ]
  return { players, bankTeamIds }
}

/**
 * Acak urutan pemain menggunakan seed berbeda dari team shuffle.
 * Suffix ':order' agar RNG stream tidak berkorelasi dengan shuffle negara.
 */
export function shufflePlayerOrder(names: string[], seed: string): string[] {
  return shuffle([...names], makeRng(seed + ':order'))
}

/**
 * Hitung teams untuk satu pemain di posisi playerIndex dari urutan yang sudah diacak.
 * Deterministik dan provably fair: seed sama → hasil identik.
 */
export function drawForPlayer(
  teams: Team[],
  playerOrder: string[],
  teamsPerPlayer: number,
  seed: string,
  playerIndex: number,
): Player {
  const { left, right } = splitBySide(teams)
  const shuffledL = shuffle(left, makeRng(seed + ':L'))
  const shuffledR = shuffle(right, makeRng(seed + ':R'))
  const alloc = computeAllocation(playerOrder.length, teamsPerPlayer, seed)

  // offset kumulatif sampai pemain ini (konsisten dengan drawTeams).
  let lOff = 0
  let rOff = 0
  for (let i = 0; i < playerIndex; i++) {
    lOff += alloc[i].leftCount
    rOff += alloc[i].rightCount
  }
  const { leftCount, rightCount } = alloc[playerIndex]
  const lt = shuffledL.slice(lOff, lOff + leftCount)
  const rt = shuffledR.slice(rOff, rOff + rightCount)
  const name = playerOrder[playerIndex]
  return {
    id: `p${playerIndex}-${slug(name)}`,
    name,
    teamIds: [...lt, ...rt].map((t) => t.id),
  }
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
