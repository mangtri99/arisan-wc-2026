import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePoolStore } from '../stores/pool'
import { QUALIFIED_32 } from '../data/bracket'

describe('applyKnockout32', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('set includedTeamIds ke 28 tim lolos', () => {
    const store = usePoolStore()
    store.applyKnockout32()
    expect(store.pool.includedTeamIds).toEqual(QUALIFIED_32)
    expect(store.effectiveTeams).toHaveLength(28)
  })

  it('pertahankan nama pemain tapi kosongkan hasil undian + balik draft', () => {
    const store = usePoolStore()
    store.setPlayerNames(['Budi', 'Sari'])
    store.runDraw()
    expect(store.pool.status).toBe('drawn')

    store.applyKnockout32()
    expect(store.pool.playerNames).toEqual(['Budi', 'Sari'])
    expect(store.pool.players).toHaveLength(0)
    expect(store.pool.status).toBe('draft')
    expect(store.pool.championTeamId).toBeNull()
  })
})
