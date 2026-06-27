import { describe, it, expect } from 'vitest'
import { QUALIFIED_32, BRACKET } from '../data/bracket'
import { TEAM_BY_ID } from '../data/teams'

describe('QUALIFIED_32', () => {
  it('berisi 28 id (24 juara/runner-up + 4 peringkat-3 terkunci)', () => {
    expect(QUALIFIED_32).toHaveLength(28)
  })

  it('semua id unik', () => {
    expect(new Set(QUALIFIED_32).size).toBe(QUALIFIED_32.length)
  })

  it('semua id valid di TEAM_BY_ID', () => {
    for (const id of QUALIFIED_32) expect(TEAM_BY_ID[id]).toBeTruthy()
  })
})

describe('BRACKET', () => {
  it('punya 16 match R32', () => {
    expect(BRACKET.filter((m) => m.round === 'R32')).toHaveLength(16)
  })

  it('setiap slot kind=team mereferensi tim valid', () => {
    for (const m of BRACKET) {
      for (const s of [m.home, m.away]) {
        if (s.kind === 'team') expect(TEAM_BY_ID[s.teamId]).toBeTruthy()
      }
    }
  })

  it('id match unik', () => {
    const ids = BRACKET.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
