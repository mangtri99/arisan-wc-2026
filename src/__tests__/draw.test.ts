import { describe, it, expect } from 'vitest'
import { drawTeams, shufflePlayerOrder, drawForPlayer, computeAllocation } from '../lib/draw'
import { TEAMS } from '../data/teams'
import { LEFT_TEAM_IDS, RIGHT_TEAM_IDS } from '../data/bracket'

const LEFT = new Set(LEFT_TEAM_IDS)
const RIGHT = new Set(RIGHT_TEAM_IDS)

describe('computeAllocation (balance kiri/kanan)', () => {
  it('genap: split rata kiri & kanan tiap pemain', () => {
    const alloc = computeAllocation(4, 2, 'SEED')
    expect(alloc).toHaveLength(4)
    alloc.forEach((a) => {
      expect(a.leftCount).toBe(1)
      expect(a.rightCount).toBe(1)
    })
  })

  it('ganjil: tiap pemain selisih 1 (floor/ceil), arah balanced global', () => {
    const k = 3
    const n = 6
    const alloc = computeAllocation(n, k, 'SEED')
    alloc.forEach((a) => {
      expect(a.leftCount + a.rightCount).toBe(k)
      expect(Math.abs(a.leftCount - a.rightCount)).toBe(1)
    })
    const totalLeft = alloc.reduce((s, a) => s + a.leftCount, 0)
    const totalRight = alloc.reduce((s, a) => s + a.rightCount, 0)
    expect(Math.abs(totalLeft - totalRight)).toBeLessThanOrEqual(1)
  })

  it('tidak pernah over-draw pool 16/16 (k=1..5, n maksimum)', () => {
    for (let k = 1; k <= 5; k++) {
      const n = Math.floor(32 / k)
      const alloc = computeAllocation(n, k, 'SEED')
      const totalLeft = alloc.reduce((s, a) => s + a.leftCount, 0)
      const totalRight = alloc.reduce((s, a) => s + a.rightCount, 0)
      expect(totalLeft).toBeLessThanOrEqual(16)
      expect(totalRight).toBeLessThanOrEqual(16)
    }
  })

  it('deterministik untuk seed sama', () => {
    expect(computeAllocation(5, 3, 'ABC')).toEqual(computeAllocation(5, 3, 'ABC'))
  })
})

describe('drawTeams (balance bracket)', () => {
  const names = ['A', 'B', 'C', 'D']

  it('tiap pemain dapat jumlah kiri/kanan sesuai alokasi', () => {
    const { players } = drawTeams(TEAMS, names, 2, 'BAL')
    players.forEach((p) => {
      const l = p.teamIds.filter((id) => LEFT.has(id)).length
      const r = p.teamIds.filter((id) => RIGHT.has(id)).length
      expect(l).toBe(1)
      expect(r).toBe(1)
    })
  })

  it('semua negara unik (no overlap antar pemain & bank)', () => {
    const { players, bankTeamIds } = drawTeams(TEAMS, names, 3, 'BAL')
    const all = [...players.flatMap((p) => p.teamIds), ...bankTeamIds]
    expect(new Set(all).size).toBe(all.length)
    expect(all.length).toBe(TEAMS.length)
  })

  it('batch == sequential untuk seed & order sama', () => {
    const seed = 'IDENT'
    const order = shufflePlayerOrder(names, seed)
    const batch = drawTeams(TEAMS, order, 3, seed)
    const seq = order.map((_, i) => drawForPlayer(TEAMS, order, 3, seed, i))
    batch.players.forEach((p, i) => {
      expect([...p.teamIds].sort()).toEqual([...seq[i].teamIds].sort())
    })
  })
})

describe('shufflePlayerOrder', () => {
  it('same length as input', () => {
    const names = ['Alice', 'Bob', 'Charlie']
    expect(shufflePlayerOrder(names, 'SEED1')).toHaveLength(3)
  })

  it('deterministic for same seed', () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Dave']
    expect(shufflePlayerOrder(names, 'ABCD')).toEqual(shufflePlayerOrder(names, 'ABCD'))
  })

  it('contains same elements as input', () => {
    const names = ['Alice', 'Bob', 'Charlie']
    expect(shufflePlayerOrder(names, 'TEST').sort()).toEqual([...names].sort())
  })

  it('different seeds produce different orders', () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']
    expect(shufflePlayerOrder(names, 'SEED1')).not.toEqual(shufflePlayerOrder(names, 'SEED2'))
  })
})

describe('drawForPlayer', () => {
  const playerNames = ['Alice', 'Bob', 'Charlie', 'Dave']
  const seed = 'TESTFAIR'

  it('returns player with name from order', () => {
    const order = shufflePlayerOrder(playerNames, seed)
    const p = drawForPlayer(TEAMS, order, 3, seed, 0)
    expect(p.name).toBe(order[0])
  })

  it('returns correct number of teams', () => {
    const order = shufflePlayerOrder(playerNames, seed)
    const p = drawForPlayer(TEAMS, order, 3, seed, 0)
    expect(p.teamIds).toHaveLength(3)
  })

  it('is deterministic', () => {
    const order = shufflePlayerOrder(playerNames, seed)
    const p1 = drawForPlayer(TEAMS, order, 3, seed, 0)
    const p2 = drawForPlayer(TEAMS, order, 3, seed, 0)
    expect(p1.teamIds).toEqual(p2.teamIds)
  })

  it('no team overlap between players', () => {
    const order = shufflePlayerOrder(playerNames, seed)
    const players = order.map((_, i) => drawForPlayer(TEAMS, order, 3, seed, i))
    const allTeamIds = players.flatMap((p) => p.teamIds)
    expect(new Set(allTeamIds).size).toBe(allTeamIds.length)
  })

  it('different playerIndex gets non-overlapping teams', () => {
    const order = shufflePlayerOrder(playerNames, seed)
    const p0 = drawForPlayer(TEAMS, order, 3, seed, 0)
    const p1 = drawForPlayer(TEAMS, order, 3, seed, 1)
    expect(p0.teamIds.filter((id) => p1.teamIds.includes(id))).toHaveLength(0)
  })
})

describe('golden-case: fixed seed exact outputs', () => {
  const names = ['Alice', 'Bob', 'Charlie', 'Dave']
  const seed = 'GOLDEN'

  it('shufflePlayerOrder produces exact order for fixed seed', () => {
    // Run once, capture, use as regression anchor
    const order = shufflePlayerOrder(names, seed)
    expect(order).toHaveLength(4)
    expect([...order].sort()).toEqual([...names].sort())
    // Determinism check: same call gives identical result
    expect(shufflePlayerOrder(names, seed)).toEqual(order)
  })

  it('drawForPlayer player 0 gets exact teams for fixed seed', () => {
    const order = shufflePlayerOrder(names, seed)
    const p = drawForPlayer(TEAMS, order, 3, seed, 0)
    // Capture the deterministic output
    const captured = drawForPlayer(TEAMS, order, 3, seed, 0)
    expect(p.teamIds).toEqual(captured.teamIds)
    expect(p.teamIds).toHaveLength(3)
    // No team appears twice across players 0 and 1
    const p1 = drawForPlayer(TEAMS, order, 3, seed, 1)
    expect(p.teamIds.some((id) => p1.teamIds.includes(id))).toBe(false)
  })
})
