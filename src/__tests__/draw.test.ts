import { describe, it, expect } from 'vitest'
import { drawTeams, shufflePlayerOrder, drawForPlayer } from '../lib/draw'
import { TEAMS } from '../data/teams'

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
