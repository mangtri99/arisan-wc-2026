import { describe, it, expect } from 'vitest'
import { ownedTeamIds } from '../lib/bracket'

describe('ownedTeamIds', () => {
  it('kumpulkan semua teamId dari players', () => {
    const set = ownedTeamIds([
      { teamIds: ['BRA', 'GER'] },
      { teamIds: ['USA'] },
    ])
    expect(set).toEqual(new Set(['BRA', 'GER', 'USA']))
  })

  it('set kosong untuk players kosong', () => {
    expect(ownedTeamIds([])).toEqual(new Set())
  })
})
